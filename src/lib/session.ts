import { SessionOptions } from "iron-session";

export interface SessionData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "analyst" | "viewer";
    customerId: string;
  };
}

export const sessionOptions: SessionOptions = {
  cookieName: "__Secure-sciath-session",
  password:
    process.env.SESSION_SECRET ??
    "DEVELOPMENT-ONLY-SECRET-MUST-BE-32-CHARS-LONG!",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export const DJANGO_API_URL =
  process.env.DJANGO_API_URL ?? "http://localhost:8000";
