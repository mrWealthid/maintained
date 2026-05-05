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
import { INVITE_STATUS } from "@/shared/enums/enums";
import {
  toLegacySessionRole,
} from "@/shared/auth/roles";
import User from "@/models/userModel";
import RoleDefinition from "@/models/roleDefinitionModel";
import {
  TeamRoleAssignmentUpdateSchema,
  TeamDeactivatePayloadSchema,
} from "@/features/team/models/team.model";

const getRequestId = (req: NextRequest) =>
  req.headers.get("x-request-id") ?? undefined;

async function requireMembership(workspaceId: string, userId: string) {
  const user = await User.findOne({
    _id: userId,
    "memberships.business": new mongoose.Types.ObjectId(workspaceId),
  });
  if (!user) throw ApiError.notFound("Team member not found");

  const membership = user.memberships.find(
    (m) => String(m.business) === workspaceId,
  );
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

      const { user, membership } = await requireMembership(businessId, id);
      membership.status = INVITE_STATUS.declined;
      await user.save({ validateBeforeSave: false });

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

    const { user, membership } = await requireMembership(businessId, id);

    if ("roleDefinitionId" in payload) {
      const role = await RoleDefinition.findById(payload.roleDefinitionId);
      if (!role) throw ApiError.badRequest("Role definition not found");
      membership.roleDefinition = role._id as never;
      membership.role = (toLegacySessionRole(role.legacyRole) ??
        role.legacyRole) as never;
    } else {
      membership.roleDefinition = null as never;
      membership.role = (toLegacySessionRole(payload.role) ??
        payload.role) as never;
    }

    await user.save({ validateBeforeSave: false });

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

    const { user } = await requireMembership(businessId, id);
    user.memberships = user.memberships.filter(
      (m) => String(m.business) !== businessId,
    ) as never;
    await user.save({ validateBeforeSave: false });

    return NextResponse.json({
      status: "success",
      message: "Team record removed",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
