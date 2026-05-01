import { NextRequest, NextResponse } from "next/server";

import { errorToNextResponse } from "@/lib/errors/apiError";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { getSessionTimeoutMinutesForVerifiedUser } from "@/lib/auth/session-timeout";

export async function POST(request: NextRequest) {
  try {
    const verifiedUser = await getVerifiedUser(request);

    if (!verifiedUser) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 },
      );
    }

    const sessionTimeoutMinutes =
      await getSessionTimeoutMinutesForVerifiedUser(verifiedUser);

    return NextResponse.json({
      status: "success",
      data: {
        refreshedAt: new Date().toISOString(),
        sessionTimeoutMinutes,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
