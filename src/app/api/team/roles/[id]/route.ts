import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import {
  findActiveWorkspaceRoleDefinition,
  normalizeWorkspaceRolePermissions,
  syncWorkspaceMembershipRoleAssignments,
} from "@/lib/auth/workspace-role-management";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { WorkspaceRoleDefinitionPayloadSchema } from "@/features/access-control/models/access-control.model";
import RoleDefinition, {
  ROLE_DEFINITION_STATUS,
} from "@/models/roleDefinitionModel";
import User from "@/models/userModel";
import {
  PERMISSION,
  PERMISSION_SCOPE,
} from "@/shared/auth/permission-registry";
import { INVITE_STATUS } from "@/shared/enums/enums";

connect();

const getRequestId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    await assertWorkspacePermissionKey(verify, PERMISSION.TEAM_ROLE_MANAGE);
    const { id } = await params;
    const currentRole = await findActiveWorkspaceRoleDefinition({
      workspaceId: verify.businessId,
      roleDefinitionId: id,
    });

    if (!currentRole) {
      throw ApiError.notFound("Workspace role not found");
    }

    if (currentRole.locked) {
      throw ApiError.forbidden("This workspace role cannot be edited");
    }

    const payload = parseOrThrow(
      WorkspaceRoleDefinitionPayloadSchema,
      await request.json()
    );

    await RoleDefinition.updateOne(
      {
        _id: id,
        workspace: verify.businessId,
        scope: PERMISSION_SCOPE.workspace,
        status: ROLE_DEFINITION_STATUS.active,
      },
      {
        $set: {
          name: currentRole.isSystem ? currentRole.name : payload.name,
          description: payload.description,
          permissions: normalizeWorkspaceRolePermissions(payload.permissions),
          legacyRole: currentRole.isSystem
            ? currentRole.legacyRole
            : payload.legacyRole,
          updatedBy: verify.id,
        },
      }
    );

    if (!currentRole.isSystem && currentRole.legacyRole !== payload.legacyRole) {
      await syncWorkspaceMembershipRoleAssignments({
        workspaceId: verify.businessId,
        roleDefinitionId: id,
        legacyRole: payload.legacyRole,
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Workspace role updated",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    await assertWorkspacePermissionKey(verify, PERMISSION.TEAM_ROLE_MANAGE);
    const { id } = await params;
    const role = await findActiveWorkspaceRoleDefinition({
      workspaceId: verify.businessId,
      roleDefinitionId: id,
    });

    if (!role) {
      throw ApiError.notFound("Workspace role not found");
    }

    if (role.locked || role.isSystem) {
      throw ApiError.forbidden("System workspace roles cannot be archived");
    }

    const assignedMembers = await User.countDocuments({
      memberships: {
        $elemMatch: {
          business: verify.businessId,
          roleDefinition: id,
          status: INVITE_STATUS.activated,
        },
      },
    });

    if (assignedMembers > 0) {
      throw ApiError.forbidden(
        "Reassign members before archiving this workspace role"
      );
    }

    await RoleDefinition.updateOne(
      {
        _id: id,
        workspace: verify.businessId,
        scope: PERMISSION_SCOPE.workspace,
        status: ROLE_DEFINITION_STATUS.active,
      },
      {
        $set: {
          status: ROLE_DEFINITION_STATUS.archived,
          updatedBy: verify.id,
        },
      }
    );

    return NextResponse.json({
      status: "success",
      message: "Workspace role archived",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
