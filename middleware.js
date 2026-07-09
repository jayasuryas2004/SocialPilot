import { NextResponse } from "next/server";

export function middleware(request) {
  // Placeholder for now — always allows the request through.
  // Once login is built, this will check for a valid session/JWT
  // and redirect to /login if the user is trying to reach a
  // (dashboard) route without one.
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