import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertPermission } from "@/lib/auth/permission-guards";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { PERMISSION } from "@/shared/auth/permission-registry";
import Business from "@/models/businessModel";
import WorkspaceInvite from "@/models/workspaceInviteModel";
import { sendTeamInviteEmail } from "@/lib/email/senders/team/sendTeamInviteEmail";
import {
  generateWorkspaceInviteToken,
  upsertPendingWorkspaceInvite,
} from "@/lib/tenancy/invites";
import { findPendingWorkspaceInviteForWorkspaceSubject } from "@/lib/tenancy/workspace-invite-access";
import { WORKSPACE_INVITE_STATUS } from "@/lib/tenancy/model";

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
    const directInvite = mongoose.Types.ObjectId.isValid(id)
      ? await WorkspaceInvite.findOne({
          _id: id,
          workspace: businessId,
          status: WORKSPACE_INVITE_STATUS.pending,
        }).select("name email role invitedUser")
      : null;
    const workspaceInviteQuery =
      mongoose.Types.ObjectId.isValid(id)
        ? findPendingWorkspaceInviteForWorkspaceSubject({
            workspaceId: businessId,
            invitedUserId: id,
          })
        : null;
    const workspaceInvite = workspaceInviteQuery
      ? await workspaceInviteQuery.select("name email role invitedUser")
      : null;
    const inviteRecord = directInvite ?? workspaceInvite;

    if (!inviteRecord) {
      throw ApiError.notFound("Invite not found");
    }

    const rawToken = generateWorkspaceInviteToken();
    const sentAt = new Date();

    await upsertPendingWorkspaceInvite({
      workspaceId: businessId,
      email: inviteRecord.email,
      name: inviteRecord.name,
      role: inviteRecord.role,
      invitedBy: verify.id,
      invitedUser: inviteRecord.invitedUser ?? null,
      rawToken,
      sentAt,
    });

    const business = await Business.findById(businessId)
      .select("name workspaceType")
      .lean<{ name?: string; workspaceType?: string | null } | null>();

    const emailResult = await sendTeamInviteEmail({
      request,
      businessId,
      to: inviteRecord.email,
      attendeeName: inviteRecord.name,
      workspaceName: business?.name ?? "Workspace",
      workspaceType: business?.workspaceType,
      rawToken,
    });

    if (!emailResult.sent) {
      throw ApiError.unavailable(
        emailResult.error ||
          emailResult.skippedReason ||
          "Unable to resend team invite email",
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Invitation resent",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
