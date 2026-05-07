import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ensurePlatformRoleDefinitions } from "@/lib/auth/role-definitions";
import {
  getPlatformRolePermissionCatalog,
  listActivePlatformRoleDefinitions,
} from "@/lib/auth/platform-role-management";
import { assertPermission } from "@/lib/auth/permission-guards";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { PERMISSION } from "@/shared/auth/permission-registry";

connect();

const getRequestId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    await assertPermission(
      {
        userId: verify.id,
        businessId: verify.businessId,
        platformRole: verify.platformRole,
        workspaceRole: verify.workspaceRole,
      },
      PERMISSION.PLATFORM_SETTINGS_VIEW
    );

    await ensurePlatformRoleDefinitions({ createdBy: verify.id });

    const [roles, permissionCatalog] = await Promise.all([
      listActivePlatformRoleDefinitions(),
      Promise.resolve(getPlatformRolePermissionCatalog()),
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
