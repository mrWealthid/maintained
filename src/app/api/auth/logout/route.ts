import { errorToNextResponse } from "@/lib/errors/apiError";
import {
  AUTH_COOKIE_NAME,
  getClearedAuthCookieOptions,
} from "@/lib/auth/cookie";
import { revokeAuthSession } from "@/lib/auth/session";
import { verifyToken } from "@/lib/auth/token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const payload = token ? verifyToken(token) : null;
    if (payload?.sessionId) {
      await revokeAuthSession(payload.sessionId);
    }

    const response = NextResponse.json({
      status: "success",
      message: "User was logged out",
    });
    response.cookies.set(AUTH_COOKIE_NAME, "", getClearedAuthCookieOptions());

    return response;
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
