import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertPermission } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { PERMISSION } from "@/shared/auth/permission-registry";
import User from "@/models/userModel";
import WorkspaceInvite from "@/models/workspaceInviteModel";
import RoleDefinition from "@/models/roleDefinitionModel";
import {
  findPendingWorkspaceInviteForWorkspaceSubject,
  revokePendingWorkspaceInvite,
  updatePendingWorkspaceInviteRole,
} from "@/lib/tenancy/workspace-invite-access";
import { WORKSPACE_INVITE_STATUS } from "@/lib/tenancy/model";
import {
  deleteWorkspaceMembership,
  findWorkspaceMembershipByUser,
} from "@/lib/tenancy/workspace-membership-access";
import { MEMBERSHIP_STATUS } from "@/shared/auth/roles";
import {
  TeamRoleAssignmentUpdateSchema,
  TeamDeactivatePayloadSchema,
} from "@/features/team/models/team.model";

const getRequestId = (req: NextRequest) =>
  req.headers.get("x-request-id") ?? undefined;

async function requireMembership(workspaceId: string, userId: string) {
  const [user, membership] = await Promise.all([
    User.findById(userId),
    findWorkspaceMembershipByUser({
      workspaceId,
      userId,
      statuses: [MEMBERSHIP_STATUS.active, MEMBERSHIP_STATUS.suspended],
    }),
  ]);
  if (!user) throw ApiError.notFound("Team member not found");
  if (!membership) throw ApiError.notFound("Team member not found");
  return { user, membership };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    const businessId = verify.businessId;
    if (!businessId) throw ApiError.badRequest("No active workspace");

    const { id } = await params;
    if (id === verify.id) {
      throw ApiError.badRequest("You cannot update your own membership.");
    }

    const body = await request.json();

    if ("action" in body && body.action === "deactivate") {
      parseOrThrow(TeamDeactivatePayloadSchema, body);
      await assertPermission(
        {
          userId: verify.id,
          businessId,
          platformRole: verify.platformRole,
          workspaceRole: verify.workspaceRole,
        },
        PERMISSION.TEAM_REMOVE,
      );

      const { membership } = await requireMembership(businessId, id);
      membership.status = MEMBERSHIP_STATUS.suspended;
      await membership.save();

      return NextResponse.json({
        status: "success",
        message: "Team member deactivated",
      });
    }

    const payload = parseOrThrow(TeamRoleAssignmentUpdateSchema, body);
    await assertPermission(
      {
        userId: verify.id,
        businessId,
        platformRole: verify.platformRole,
        workspaceRole: verify.workspaceRole,
      },
      PERMISSION.TEAM_ROLE_MANAGE,
    );

    let membershipTarget: Awaited<ReturnType<typeof requireMembership>> | null = null;
    try {
      membershipTarget = await requireMembership(businessId, id);
    } catch (error) {
      if (!("kind" in payload) || payload.kind !== "invite") {
        throw error;
      }

      const directInvite = mongoose.Types.ObjectId.isValid(id)
        ? await WorkspaceInvite.findOne({
            _id: id,
            workspace: businessId,
            status: WORKSPACE_INVITE_STATUS.pending,
          }).select("_id")
        : null;
      const workspaceInviteQuery = mongoose.Types.ObjectId.isValid(id)
        ? findPendingWorkspaceInviteForWorkspaceSubject({
            workspaceId: businessId,
            invitedUserId: id,
          })
        : null;
      const workspaceInvite = workspaceInviteQuery
        ? await workspaceInviteQuery.select("_id")
        : null;
      const inviteToUpdate = directInvite ?? workspaceInvite;

      if (!inviteToUpdate) {
        throw ApiError.notFound("Team invite not found");
      }

      await updatePendingWorkspaceInviteRole({
        inviteId: inviteToUpdate._id as mongoose.Types.ObjectId,
        role: payload.role as never,
      });

      return NextResponse.json({
        status: "success",
        message: "Invite role updated",
      });
    }

    const { user, membership } = membershipTarget;

    if ("roleDefinitionId" in payload) {
      const role = await RoleDefinition.findById(payload.roleDefinitionId);
      if (!role) throw ApiError.badRequest("Role definition not found");
      membership.roleDefinition = role._id as never;
      membership.role = role.legacyRole as never;
    } else {
      membership.roleDefinition = null as never;
      membership.role = payload.role as never;
    }

    await membership.save();

    return NextResponse.json({
      status: "success",
      message: "Role updated",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function DELETE(
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
      PERMISSION.TEAM_REMOVE,
    );

    const { id } = await params;
    if (id === verify.id) {
      throw ApiError.badRequest("You cannot remove your own membership.");
    }

    let membershipTarget: Awaited<ReturnType<typeof requireMembership>> | null = null;
    try {
      membershipTarget = await requireMembership(businessId, id);
    } catch (error) {
      const directInvite = mongoose.Types.ObjectId.isValid(id)
        ? await WorkspaceInvite.findOne({
            _id: id,
            workspace: businessId,
            status: WORKSPACE_INVITE_STATUS.pending,
          }).select("_id")
        : null;
      const workspaceInviteQuery = mongoose.Types.ObjectId.isValid(id)
        ? findPendingWorkspaceInviteForWorkspaceSubject({
            workspaceId: businessId,
            invitedUserId: id,
          })
        : null;
      const workspaceInvite = workspaceInviteQuery
        ? await workspaceInviteQuery.select("_id")
        : null;
      const inviteToDelete = directInvite ?? workspaceInvite;

      if (!inviteToDelete) {
        throw error;
      }

      await revokePendingWorkspaceInvite({
        inviteId: inviteToDelete._id as mongoose.Types.ObjectId,
      });

      return NextResponse.json({
        status: "success",
        message: "Invitation deleted",
      });
    }

    await deleteWorkspaceMembership({
      workspaceId: businessId,
      userId: membershipTarget.user._id as mongoose.Types.ObjectId,
    });

    return NextResponse.json({
      status: "success",
      message: "Team record removed",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
