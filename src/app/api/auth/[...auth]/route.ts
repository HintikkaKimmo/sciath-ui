import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import {
  sessionOptions,
  SessionData,
  DJANGO_API_URL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
} from "@/lib/session";

// GET /api/auth/me — return current user from session
async function handleMe() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}

// POST /api/auth/logout — revoke tokens and destroy session
async function handleLogout() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  // Best-effort token revocation on backend
  if (session.refreshToken) {
    try {
      await fetch(`${DJANGO_API_URL}/o/revoke_token/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: session.refreshToken,
          token_type_hint: "refresh_token",
          client_id: OAUTH_CLIENT_ID,
          client_secret: OAUTH_CLIENT_SECRET,
        }),
      });
    } catch {
      // Revocation is best-effort; don't block logout if Django is unreachable
    }
  }

  session.destroy();
  return NextResponse.json({ ok: true });
}

// POST /api/auth/refresh — refresh the access token
async function handleRefresh() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  if (!session.refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const res = await fetch(
    `${DJANGO_API_URL}/api/auth/v1/token/refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    }
  );

  if (!res.ok) {
    session.destroy();
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }

  const data = await res.json();
  session.accessToken = data.access_token;
  if (data.refresh_token) {
    session.refreshToken = data.refresh_token;
  }
  session.expiresAt = Date.now() + data.expires_in * 1000;
  await session.save();

  return NextResponse.json({ ok: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ auth: string[] }> }
) {
  const { auth } = await params;
  const action = auth[0];

  switch (action) {
    case "me":
      return handleMe();
    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ auth: string[] }> }
) {
  const { auth } = await params;
  const action = auth[0];

  switch (action) {
    case "logout":
      return handleLogout();
    case "refresh":
      return handleRefresh();
    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
