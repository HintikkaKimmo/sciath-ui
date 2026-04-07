/**
 * DEV-ONLY: Set up a session with a pre-created OAuth token.
 * This bypasses the OAuth redirect flow for local testing.
 *
 * Usage: GET /api/dev-login?token=qa-test-token-for-local-dev
 *
 * DO NOT deploy this to production.
 */

import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData, DJANGO_API_URL } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev only" }, { status: 403 });
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token param required" }, { status: 400 });
  }

  // Fetch user profile from Django using the token
  const profileRes = await fetch(`${DJANGO_API_URL}/api/core/v1/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!profileRes.ok) {
    return NextResponse.json(
      { error: "Invalid token", status: profileRes.status },
      { status: 401 }
    );
  }

  const profile = await profileRes.json();

  // Set up iron-session
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.accessToken = token;
  session.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  session.user = {
    id: profile.id,
    email: profile.email,
    name: profile.name ?? profile.email,
    role: profile.role,
    customerId: profile.customer_id,
  };
  await session.save();

  // Redirect to dashboard
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
