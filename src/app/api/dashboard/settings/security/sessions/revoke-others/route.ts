import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import AuthSession from "@/models/authSessionModel";

const ACTIVE_SESSION_REVOKED_AT = null;

export async function POST(request: NextRequest) {
  try {
    await connect();

    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    await AuthSession.updateMany(
      {
        user: verify.id,
        businessId: verify.businessId,
        revokedAt: ACTIVE_SESSION_REVOKED_AT,
        sessionId: { $ne: verify.sessionId },
      },
      { $set: { revokedAt: new Date() } },
    );

    return NextResponse.json({
      status: "success",
      message: "Other sessions revoked",
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
