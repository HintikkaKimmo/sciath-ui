import { SessionOptions } from "iron-session";

export interface SessionData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  codeVerifier?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "analyst" | "viewer";
    customerId: string;
  };
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET environment variable is required in production. " +
        "Generate with: openssl rand -hex 32"
    );
  }
  return secret ?? "DEVELOPMENT-ONLY-SECRET-MUST-BE-32-CHARS-LONG!";
}

export const sessionOptions: SessionOptions = {
  cookieName:
    process.env.NODE_ENV === "production"
      ? "__Secure-sciath-session"
      : "sciath-session",
  // Resolve when a session is used so production can never use the dev fallback.
  get password() {
    return getSessionSecret();
  },
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export const DJANGO_API_URL =
  process.env.DJANGO_API_URL ?? "http://localhost:8000";

export const OAUTH_CLIENT_ID =
  process.env.OAUTH_CLIENT_ID ?? "";

export const OAUTH_CLIENT_SECRET =
  process.env.OAUTH_CLIENT_SECRET ?? "";
