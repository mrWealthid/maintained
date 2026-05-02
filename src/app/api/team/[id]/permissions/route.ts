import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { getEffectiveWorkspacePermissionSet } from "@/lib/auth/effective-permissions";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { TeamMemberPermissionOverridePayloadSchema } from "@/features/access-control/models/access-control.model";
import UserPermissionOverride from "@/models/userPermissionOverrideModel";
import User from "@/models/userModel";
import {
  PERMISSION,
  PERMISSION_SCOPE,
} from "@/shared/auth/permission-registry";
import { INVITE_STATUS } from "@/shared/enums/enums";

connect();

const getRequestId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

async function assertTeamMemberExists(userId: string, workspaceId: string) {
  const member = await User.exists({
    _id: userId,
    memberships: {
      $elemMatch: {
        business: workspaceId,
        status: { $in: [INVITE_STATUS.activated, INVITE_STATUS.invited] },
      },
    },
  });

  if (!member) {
    throw ApiError.notFound("Team member not found");
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    await assertWorkspacePermissionKey(
      verify,
      PERMISSION.TEAM_PERMISSION_MANAGE
    );
    const { id } = await params;
    await assertTeamMemberExists(id, verify.businessId);

    const now = new Date();
    const [effectivePermissions, directOverrides] = await Promise.all([
      getEffectiveWorkspacePermissionSet({
        userId: id,
        businessId: verify.businessId,
      }),
      UserPermissionOverride.find({
        user: id,
        workspace: verify.businessId,
        scope: PERMISSION_SCOPE.workspace,
        revokedAt: null,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      })
        .sort({ createdAt: -1 })
        .select("permission effect reason expiresAt createdAt")
        .lean<
          Array<{
            _id: { toString(): string };
            permission: string;
            effect: string;
            reason?: string | null;
            expiresAt?: Date | null;
            createdAt: Date;
          }>
        >(),
    ]);

    return NextResponse.json({
      status: "success",
      data: {
        effectivePermissions: Array.from(effectivePermissions).sort(),
        directOverrides: directOverrides.map((override) => ({
          id: override._id.toString(),
          permission: override.permission,
          effect: override.effect,
          reason: override.reason ?? "",
          expiresAt: override.expiresAt?.toISOString() ?? null,
          createdAt: override.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    await assertWorkspacePermissionKey(
      verify,
      PERMISSION.TEAM_PERMISSION_MANAGE
    );
    const { id } = await params;
    await assertTeamMemberExists(id, verify.businessId);

    const payload = parseOrThrow(
      TeamMemberPermissionOverridePayloadSchema,
      await request.json()
    );
    const dedupedOverrides = Array.from(
      payload.overrides
        .reduce(
          (acc, override) => acc.set(override.permission, override),
          new Map<string, (typeof payload.overrides)[number]>()
        )
        .values()
    );
    const revokedAt = new Date();

    await UserPermissionOverride.updateMany(
      {
        user: id,
        workspace: verify.businessId,
        scope: PERMISSION_SCOPE.workspace,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt,
          revokedBy: verify.id,
        },
      }
    );

    if (dedupedOverrides.length > 0) {
      await UserPermissionOverride.insertMany(
        dedupedOverrides.map((override) => ({
          user: id,
          workspace: verify.businessId,
          scope: PERMISSION_SCOPE.workspace,
          permission: override.permission,
          effect: override.effect,
          reason: override.reason || "",
          expiresAt: override.expiresAt ? new Date(override.expiresAt) : null,
          createdBy: verify.id,
        }))
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Team permissions updated",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
