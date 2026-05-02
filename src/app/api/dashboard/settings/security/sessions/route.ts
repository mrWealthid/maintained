import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import AuthSession from "@/models/authSessionModel";

const ACTIVE_SESSION_REVOKED_AT = null;

export async function GET(request: NextRequest) {
  try {
    await connect();

    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    const sessions = await AuthSession.find({
      user: verify.id,
      businessId: verify.businessId,
      revokedAt: ACTIVE_SESSION_REVOKED_AT,
    })
      .select("sessionId ipAddress userAgent createdAt lastSeenAt")
      .sort({ lastSeenAt: -1, createdAt: -1 })
      .lean<
        Array<{
          sessionId: string;
          ipAddress?: string;
          userAgent?: string;
          createdAt: Date;
          lastSeenAt: Date;
        }>
      >();

    const orderedSessions = sessions.sort((left, right) => {
      if (left.sessionId === verify.sessionId) return -1;
      if (right.sessionId === verify.sessionId) return 1;
      return right.lastSeenAt.getTime() - left.lastSeenAt.getTime();
    });

    return NextResponse.json({
      status: "success",
      data: {
        sessions: orderedSessions.map((session) => ({
          sessionId: session.sessionId,
          current: session.sessionId === verify.sessionId,
          ipAddress: session.ipAddress?.trim() || null,
          userAgent: session.userAgent?.trim() || null,
          createdAt: session.createdAt.toISOString(),
          lastSeenAt: session.lastSeenAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
