import { NextResponse } from "next/server";

export function middleware(request) {
  // Read authentication token from cookie
  const token = request.cookies.get("sp_token")?.value;

  // Redirect to login if user attempts to access protected routes without a valid session token
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
  ],
};