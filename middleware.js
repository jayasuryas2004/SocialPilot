import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read authentication token from cookie
  const token = request.cookies.get("sp_token")?.value;

  const isAuthRoute = pathname.startsWith("/login") ||
                      pathname.startsWith("/register") ||
                      pathname.startsWith("/forgot-password") ||
                      pathname.startsWith("/reset-password");

  // If already authenticated and trying to access login/register, redirect to /dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If not authenticated and trying to access protected routes, redirect to /login
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/calendar/:path*",
    "/posts/:path*",
    "/campaigns/:path*",
    "/accounts/:path*",
    "/analytics/:path*",
    "/reports/:path*",
    "/notifications/:path*",
    "/team/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
