import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import {
  sessionOptions,
  SessionData,
  DJANGO_API_URL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
} from "@/lib/session";

/**
 * OAuth callback page (server component).
 *
 * Flow:
 * 1. DOT redirects browser here with ?code=xxx&state=xxx
 * 2. We decode state to get the original `next` URL and PKCE code_verifier
 * 3. Exchange code for tokens via POST /o/token/ (server-to-server)
 * 4. Fetch user profile via GET /api/core/v1/me/
 * 5. Store everything in iron-session
 * 6. Redirect to the target page
 */
export default async function AuthCallback({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; state?: string }>;
}) {
  const { code, state } = await searchParams;

  if (!code) {
    redirect("/login?error=missing_code");
  }

  // Decode state to get next URL and code_verifier
  let next = "/dashboard";
  let codeVerifier: string | undefined;
  if (state) {
    try {
      const decoded = JSON.parse(
        Buffer.from(state, "base64url").toString("utf-8")
      );
      if (decoded.next) next = decoded.next;
      if (decoded.code_verifier) codeVerifier = decoded.code_verifier;
    } catch {
      // Invalid state, use defaults
    }
  }

  // If no code_verifier in state, try reading from session (set during login)
  if (!codeVerifier) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );
    codeVerifier = session.codeVerifier;
  }

  // Exchange authorization code for tokens (server-to-server)
  const tokenBody: Record<string, string> = {
    grant_type: "authorization_code",
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
    client_id: OAUTH_CLIENT_ID,
    client_secret: OAUTH_CLIENT_SECRET,
  };
  if (codeVerifier) {
    tokenBody.code_verifier = codeVerifier;
  }

  const tokenRes = await fetch(`${DJANGO_API_URL}/o/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(tokenBody),
  });

  if (!tokenRes.ok) {
    redirect("/login?error=exchange_failed");
  }

  const tokens = await tokenRes.json();

  // Fetch user profile
  const profileRes = await fetch(`${DJANGO_API_URL}/api/core/v1/me/`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = profileRes.ok ? await profileRes.json() : null;

  // Store in iron-session
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  session.accessToken = tokens.access_token;
  session.refreshToken = tokens.refresh_token;
  session.expiresAt = Date.now() + tokens.expires_in * 1000;
  session.codeVerifier = undefined; // Clean up
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

  redirect(next);
}
