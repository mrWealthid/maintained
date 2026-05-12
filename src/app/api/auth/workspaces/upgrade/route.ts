import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { isSuperAdminRole } from "@/lib/auth/roles";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { findActiveWorkspaceMembership } from "@/lib/tenancy/workspace-membership-access";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import Business from "@/models/businessModel";
import { WORKSPACE_ROLE } from "@/shared/auth/roles";
import {
  WORKSPACE_TYPE,
  getWorkspaceTypeLabel,
} from "@/shared/model/workspace.model";

const getRequestId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

export async function POST(request: NextRequest) {
  try {
    await connect();

    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    if (isSuperAdminRole(verify.role)) {
      throw ApiError.forbidden(
        "Platform admins cannot upgrade workspaces from this flow.",
      );
    }

    const businessId = verify.businessId;
    if (!businessId || !mongoose.Types.ObjectId.isValid(businessId)) {
      throw ApiError.badRequest("No current workspace to upgrade.");
    }

    const membership = await findActiveWorkspaceMembership({
      userId: verify.id,
      workspaceId: businessId,
    }).lean<{ role?: string | null } | null>();

    if (membership?.role !== WORKSPACE_ROLE.owner) {
      throw ApiError.forbidden(
        "Only the workspace owner can upgrade this workspace.",
      );
    }

    const business = await Business.findById(businessId).select(
      "workspaceType settings",
    );
    if (!business) {
      throw ApiError.notFound("Workspace not found");
    }

    if (business.workspaceType === WORKSPACE_TYPE.BUSINESS) {
      throw ApiError.badRequest("Workspace is already a business workspace.");
    }

    business.workspaceType = WORKSPACE_TYPE.BUSINESS;
    business.set(
      "settings.general.team.allowTeamInvitations",
      true,
    );
    business.set(
      "settings.general.team.defaultRoleForNewMembers",
      business.get("settings.general.team.defaultRoleForNewMembers") ??
        WORKSPACE_ROLE.member,
    );
    await business.save({ validateBeforeSave: false });

    return NextResponse.json({
      ok: true,
      message: "Workspace upgraded to a business workspace.",
      data: {
        workspaceType: business.workspaceType,
        workspaceLabel: getWorkspaceTypeLabel(business.workspaceType, {
          short: true,
        }),
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
