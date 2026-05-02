import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { connect } from "@/dbConfig/dbConfig";
import User, { UserDoc } from "@/models/userModel";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { INVITE_STATUS } from "@/shared/enums/enums";
import { z } from "zod";

connect();

const onboardBodySchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  inviteToken: z.string().min(1, "Invite token is required"),
});

export async function POST(request: NextRequest) {
  try {
    const { password, inviteToken } = parseOrThrow(
      onboardBodySchema,
      await request.json()
    );

    const hashedToken = crypto
      .createHash("sha256")
      .update(inviteToken)
      .digest("hex");

    const user = (await User.findOne({
      memberships: {
        $elemMatch: {
          inviteToken: hashedToken,
          inviteTokenExpires: { $gt: Date.now() },
        },
      },
    }).select("+password")) as UserDoc;

    if (!user) throw ApiError.badRequest("Token is invalid or has expired");

    user.password = password;
    user.passwordConfirm = password;

    const membership = user.memberships.find(
      (m) =>
        m.inviteToken === hashedToken &&
        m.inviteTokenExpires &&
        m.inviteTokenExpires > new Date(),
    );

    if (!membership) {
      throw ApiError.badRequest("Matching membership not found");
    }

    membership.status = INVITE_STATUS.activated;
    membership.inviteToken = undefined;
    membership.inviteTokenExpires = undefined;
    membership.inviteExpired = undefined;

    await user.save();

    return NextResponse.json({
      status: "success",
      message: "Password set and account activated",
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
