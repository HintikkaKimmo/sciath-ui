import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Protected routes that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/products",
  "/findings",
  "/reports",
  "/intelligence",
  "/settings",
  "/compare",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip locale handling for API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Run next-intl middleware first (handles locale detection + redirect)
  const response = intlMiddleware(req);

  // Strip locale prefix to check protected paths
  const pathWithoutLocale = pathname.replace(
    /^\/(en|de)\//,
    "/"
  ).replace(/^\/(en|de)$/, "/");

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );

  if (!isProtected) {
    return response;
  }

  // Explicit auth bypass for local development
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return response;
  }

  // Check for session cookie (existence only — validation happens server-side)
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-sciath-session"
      : "sciath-session";
  const sessionCookie = req.cookies.get(cookieName);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
