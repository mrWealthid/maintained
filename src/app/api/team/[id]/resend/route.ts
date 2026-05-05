import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertPermission } from "@/lib/auth/permission-guards";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { INVITE_STATUS } from "@/shared/enums/enums";
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import { sendTeamInviteEmail } from "@/lib/email/senders/team/sendTeamInviteEmail";
import { generateInviteToken } from "@/utils/helpers";

const getRequestId = (req: NextRequest) =>
  req.headers.get("x-request-id") ?? undefined;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    const businessId = verify.businessId;
    if (!businessId) throw ApiError.badRequest("No active workspace");

    await assertPermission(
      {
        userId: verify.id,
        businessId,
        platformRole: verify.platformRole,
        workspaceRole: verify.workspaceRole,
      },
      PERMISSION.TEAM_INVITE,
    );

    const { id } = await params;

    const user = await User.findOne({
      _id: id,
      "memberships.business": new mongoose.Types.ObjectId(businessId),
    });
    if (!user) throw ApiError.notFound("Invite not found");

    const membership = user.memberships.find(
      (m) => String(m.business) === businessId,
    );
    if (!membership) throw ApiError.notFound("Invite not found");
    if (membership.status === INVITE_STATUS.activated) {
      throw ApiError.badRequest("Member has already accepted the invite.");
    }

    const invite = generateInviteToken();
    const rawToken = invite.token;
    membership.inviteToken = rawToken;
    membership.inviteTokenExpires = invite.expires;
    membership.status = INVITE_STATUS.invited;
    await user.save({ validateBeforeSave: false });

    const business = await Business.findById(businessId)
      .select("name")
      .lean<{ name?: string } | null>();

    const emailResult = await sendTeamInviteEmail({
      request,
      businessId,
      to: user.email,
      attendeeName: user.name,
      workspaceName: business?.name ?? "Workspace",
      rawToken,
    });

    if (!emailResult.sent) {
      throw ApiError.unavailable(
        emailResult.error || "Unable to send the team invitation email",
      );
    }

    return NextResponse.json({
      status: "success",
      message: `Invite resent to ${user.email}`,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
