import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  const loginUrl = new URL("/auth/login", request.url);

  if (next && next.startsWith("/")) {
    loginUrl.searchParams.set("next", next);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  return response;
}
