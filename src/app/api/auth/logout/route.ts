import { errorToNextResponse } from "@/lib/errors/apiError";
import { revokeAuthSession } from "@/lib/auth/session";
import { verifyToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const payload = token ? verifyToken(token) : null;
    if (payload?.sessionId) {
      await revokeAuthSession(payload.sessionId);
    }

    const cookie = await cookies();
    cookie.delete("token");
    const response = NextResponse.json({
      status: "success",
      message: "User was logged out",
    });

    return response;
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
