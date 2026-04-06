import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData, DJANGO_API_URL } from "@/lib/session";

// Refresh gate: single shared promise prevents concurrent refreshes.
// All waiters get the same result (success or failure).
type RefreshResult =
  | { ok: true; access: string; refresh?: string }
  | { ok: false };

let refreshGate: Promise<RefreshResult> | null = null;

const REFRESH_BUFFER_MS = 30_000; // Proactive refresh 30s before expiry

async function doRefresh(refreshToken: string): Promise<RefreshResult> {
  try {
    const res = await fetch(
      `${DJANGO_API_URL}/api/auth/v1/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    if (!res.ok) return { ok: false };

    const data = await res.json();
    return {
      ok: true,
      access: data.access_token,
      refresh: data.refresh_token,
    };
  } catch {
    // Network error (Django unreachable, DNS failure, etc.)
    return { ok: false };
  }
}

async function ensureFreshToken(
  session: SessionData
): Promise<RefreshResult> {
  if (!session.refreshToken) return { ok: false };

  // If a refresh is already in flight, wait for it
  if (refreshGate) return refreshGate;

  refreshGate = doRefresh(session.refreshToken).finally(() => {
    refreshGate = null;
  });
  return refreshGate;
}

function isTokenNearExpiry(session: SessionData): boolean {
  return !!(
    session.expiresAt && Date.now() > session.expiresAt - REFRESH_BUFFER_MS
  );
}

async function applyRefreshResult(
  session: SessionData & { save: () => Promise<void> },
  result: RefreshResult
): Promise<boolean> {
  if (!result.ok) return false;
  session.accessToken = result.access;
  if (result.refresh) {
    session.refreshToken = result.refresh;
  }
  session.expiresAt = Date.now() + 3600 * 1000;
  await session.save();
  return true;
}

async function proxyRequest(
  req: NextRequest,
  path: string,
  accessToken?: string
): Promise<Response> {
  const url = `${DJANGO_API_URL}/api/${path}`;
  const headers = new Headers();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Forward content-type for non-GET requests
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  // Forward body for non-GET/HEAD requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    // Stream uploads: pass body through without buffering
    init.body = req.body;
    // @ts-expect-error -- Node fetch supports duplex for streaming
    init.duplex = "half";
  }

  return fetch(url, init);
}

async function handleProxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const search = req.nextUrl.search;
  const fullPath = search ? `${pathStr}${search}` : pathStr;

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  // Proactive refresh: if token is near expiry, refresh before making the call
  if (isTokenNearExpiry(session)) {
    const result = await ensureFreshToken(session);
    if (!result.ok) {
      session.destroy();
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }
    await applyRefreshResult(session, result);
  }

  // First attempt
  let res = await proxyRequest(req, fullPath, session.accessToken);

  // If 401, try refreshing the token
  if (res.status === 401 && session.refreshToken) {
    const result = await ensureFreshToken(session);

    if (result.ok) {
      await applyRefreshResult(session, result);
      // Replay original request with new token
      res = await proxyRequest(req, fullPath, session.accessToken);
    } else {
      session.destroy();
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }
  }

  // Forward the Django response
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    statusText: res.statusText,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
