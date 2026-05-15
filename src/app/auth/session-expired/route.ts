import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  LEGACY_AUTH_COOKIE_NAMES,
  getClearedAuthCookieOptions,
} from "@/lib/auth/cookie";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  const loginUrl = new URL("/auth/login", request.url);

  if (next && next.startsWith("/")) {
    loginUrl.searchParams.set("next", next);
  }

  const response = NextResponse.redirect(loginUrl);
  for (const cookieName of [AUTH_COOKIE_NAME, ...LEGACY_AUTH_COOKIE_NAMES]) {
    response.cookies.set(cookieName, "", getClearedAuthCookieOptions());
  }
  return response;
}
