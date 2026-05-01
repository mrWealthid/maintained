import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import AuthSession from "@/models/authSessionModel";

const ACTIVE_SESSION_REVOKED_AT = null;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    await connect();

    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    const { sessionId } = await params;

    if (!sessionId || sessionId === verify.sessionId) {
      throw ApiError.badRequest("Current session cannot be revoked here");
    }

    const existingSession = await AuthSession.findOne({
      sessionId,
      user: verify.id,
      businessId: verify.businessId,
    })
      .select("sessionId revokedAt")
      .lean<{ sessionId: string; revokedAt?: Date | null } | null>();

    if (!existingSession) {
      throw ApiError.notFound("Session not found");
    }

    if (existingSession.revokedAt) {
      return NextResponse.json({
        status: "success",
        message: "Session already inactive",
      });
    }

    await AuthSession.updateOne(
      {
        sessionId,
        user: verify.id,
        businessId: verify.businessId,
        revokedAt: ACTIVE_SESSION_REVOKED_AT,
      },
      { $set: { revokedAt: new Date() } },
    );

    return NextResponse.json({
      status: "success",
      message: "Session revoked",
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
