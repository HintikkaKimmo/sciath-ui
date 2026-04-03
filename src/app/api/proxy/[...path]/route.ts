import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData, DJANGO_API_URL } from "@/lib/session";

// Mutex to prevent concurrent token refreshes
let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(session: SessionData): Promise<string | null> {
  if (!session.refreshToken) return null;

  const res = await fetch(
    `${DJANGO_API_URL}/api/auth/v1/token/refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.access_token;
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

  // First attempt
  let res = await proxyRequest(req, fullPath, session.accessToken);

  // If 401, try refreshing the token (with mutex to prevent concurrent refreshes)
  if (res.status === 401 && session.refreshToken) {
    if (!refreshPromise) {
      refreshPromise = refreshToken(session).finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      // Update session with new token
      session.accessToken = newToken;
      await session.save();

      // Replay original request with new token
      res = await proxyRequest(req, fullPath, newToken);
    } else {
      // Refresh failed — clear session
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
