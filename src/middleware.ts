import { NextRequest, NextResponse } from "next/server";

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

  // Check if route is protected
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Explicit auth bypass for local development
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return NextResponse.next();
  }

  // Check for session cookie (existence only — validation happens server-side)
  const sessionCookie = req.cookies.get("__Secure-sciath-session");
  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
