import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData, DJANGO_API_URL } from "@/lib/session";

// POST /api/auth/callback — exchange Django session for API tokens
async function handleCallback(req: NextRequest) {
  const { code, state } = await req.json();

  // Exchange the authorization code with Django
  const tokenRes = await fetch(`${DJANGO_API_URL}/api/auth/v1/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }

  const tokenData = await tokenRes.json();

  // Fetch user profile
  const profileRes = await fetch(`${DJANGO_API_URL}/api/v1/me/`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile = profileRes.ok ? await profileRes.json() : null;

  // Store in encrypted cookie
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  session.accessToken = tokenData.access_token;
  session.refreshToken = tokenData.refresh_token;
  session.expiresAt = Date.now() + tokenData.expires_in * 1000;
  if (profile) {
    session.user = {
      id: profile.id,
      email: profile.email,
      name: profile.name ?? profile.email,
      role: profile.role,
      customerId: profile.customer_id,
    };
  }
  await session.save();

  return NextResponse.json({ ok: true, user: session.user });
}

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

// POST /api/auth/logout — destroy session
async function handleLogout() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
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
    case "callback":
      return handleCallback(req);
    case "logout":
      return handleLogout();
    case "refresh":
      return handleRefresh();
    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
