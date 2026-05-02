import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ensureWorkspaceRoleDefinitions } from "@/lib/auth/role-definitions";
import {
  getWorkspaceRolePermissionCatalog,
  listActiveWorkspaceRoleDefinitions,
  normalizeWorkspaceRolePermissions,
} from "@/lib/auth/workspace-role-management";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import RoleDefinition, {
  ROLE_DEFINITION_STATUS,
} from "@/models/roleDefinitionModel";
import { WorkspaceRoleDefinitionPayloadSchema } from "@/features/access-control/models/access-control.model";
import {
  PERMISSION,
  PERMISSION_SCOPE,
} from "@/shared/auth/permission-registry";

connect();

const getRequestId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

function toRoleKey(name: string) {
  const key = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

  return key || "custom_role";
}

async function buildUniqueRoleKey(args: {
  workspaceId: string;
  baseKey: string;
}) {
  let nextKey = args.baseKey;
  let suffix = 2;

  while (
    await RoleDefinition.exists({
      scope: PERMISSION_SCOPE.workspace,
      workspace: args.workspaceId,
      key: nextKey,
    })
  ) {
    nextKey = `${args.baseKey}_${suffix}`;
    suffix += 1;
  }

  return nextKey;
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    await assertWorkspacePermissionKey(verify, PERMISSION.TEAM_VIEW);
    await ensureWorkspaceRoleDefinitions({
      workspaceId: verify.businessId,
      options: { createdBy: verify.id },
    });

    const [roles, permissionCatalog] = await Promise.all([
      listActiveWorkspaceRoleDefinitions({
        workspaceId: verify.businessId,
      }),
      Promise.resolve(getWorkspaceRolePermissionCatalog()),
    ]);

    return NextResponse.json({
      status: "success",
      data: {
        roles,
        permissionCatalog,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function POST(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    await assertWorkspacePermissionKey(verify, PERMISSION.TEAM_ROLE_MANAGE);
    const payload = parseOrThrow(
      WorkspaceRoleDefinitionPayloadSchema,
      await request.json()
    );
    const key = await buildUniqueRoleKey({
      workspaceId: verify.businessId,
      baseKey: toRoleKey(payload.name),
    });

    const roleDefinition = await RoleDefinition.create({
      scope: PERMISSION_SCOPE.workspace,
      workspace: verify.businessId,
      key,
      name: payload.name,
      description: payload.description,
      permissions: normalizeWorkspaceRolePermissions(payload.permissions),
      legacyRole: payload.legacyRole,
      isSystem: false,
      isDefault: false,
      locked: false,
      status: ROLE_DEFINITION_STATUS.active,
      createdBy: verify.id,
      updatedBy: verify.id,
    });

    return NextResponse.json({
      status: "success",
      message: "Workspace role created",
      data: {
        id: roleDefinition.id,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
