import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { getEffectiveWorkspacePermissionSet } from "@/lib/auth/effective-permissions";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import { isSuperAdminRole } from "@/lib/auth/roles";
import {
  DEFAULT_WORKSPACE_TYPE,
  WORKSPACE_TYPE,
  getWorkspaceTypeLabel,
  resolveWorkspaceType,
  type WorkspaceType,
} from "@/shared/model/workspace.model";
import { resolveWorkspaceRole, WORKSPACE_ROLE } from "@/shared/auth/roles";
import { listActiveWorkspaceMemberships } from "@/lib/tenancy/workspace-membership-access";
import { getWorkspaceRolePermissionCatalog } from "@/lib/auth/workspace-role-management";

type StringableId = {
  toString(): string;
};

type LeanUser = {
  _id: StringableId;
  name?: string;
  email?: string;
  photo?: string;
  currentBusiness?: StringableId | null;
};

type LeanBusiness = {
  _id: StringableId;
  name?: string;
  logo?: string;
  workspaceType?: WorkspaceType | string | null;
  creator?: StringableId | string | null;
};

function getBusinessId(value?: StringableId | string | null) {
  return typeof value === "string" ? value : value?.toString();
}

function isWorkspaceOwner(args: {
  role?: string | null;
  business?: LeanBusiness | null;
  userId: string;
}) {
  const creatorId = getBusinessId(args.business?.creator);
  return args.role === WORKSPACE_ROLE.owner || creatorId === args.userId;
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    await connect();

    const user = await User.findById(verify.id)
      .select("name email photo currentBusiness")
      .lean<LeanUser | null>();

    if (!user) {
      throw ApiError.unauthorized("Authentication required");
    }

    const activeMemberships = await listActiveWorkspaceMemberships({
      userId: verify.id,
    }).lean<
      Array<{
        workspace?: StringableId | null;
        role?: string | null;
      }>
    >();
    const membershipBusinessIds = activeMemberships
      .map((membership) => getBusinessId(membership.workspace))
      .filter((businessId): businessId is string => Boolean(businessId));

    const businesses = membershipBusinessIds.length
      ? await Business.find({ _id: { $in: membershipBusinessIds } })
          .select("name logo workspaceType creator")
          .lean<LeanBusiness[]>()
      : [];

    const businessesById = new Map(
      businesses.map((business) => [business._id.toString(), business])
    );
    const preferredCurrentWorkspaceId =
      user.currentBusiness?.toString() ?? verify.businessId;
    let currentWorkspaceId: string | undefined;
    if (!isSuperAdminRole(verify.role)) {
      currentWorkspaceId = businessesById.has(preferredCurrentWorkspaceId)
        ? preferredCurrentWorkspaceId
        : (membershipBusinessIds[0] ?? verify.businessId);
    }
    const currentBusiness = currentWorkspaceId
      ? businessesById.get(currentWorkspaceId) ?? null
      : null;
    const currentMembership =
      activeMemberships.find(
        (membership) => getBusinessId(membership.workspace) === currentWorkspaceId
      ) ?? null;
    const workspaceType = isSuperAdminRole(verify.role)
      ? null
      : resolveWorkspaceType(currentBusiness?.workspaceType);
    const isOwner = isWorkspaceOwner({
      role: currentMembership?.role,
      business: currentBusiness,
      userId: verify.id,
    });
    const permissions = Array.from(
      await getEffectiveWorkspacePermissionSet({
        userId: verify.id,
        businessId: verify.businessId,
        platformRole: verify.platformRole,
        workspaceRole: verify.workspaceRole,
      })
    );

    const workspaces = isSuperAdminRole(verify.role)
      ? []
      : activeMemberships
          .map((membership) => {
            const businessId = getBusinessId(membership.workspace);
            if (!businessId) return null;
            const business = businessesById.get(businessId);
            if (!business) return null;
            const membershipWorkspaceType = resolveWorkspaceType(
              business.workspaceType
            );

            return {
              businessId,
              name: business.name ?? "Business",
              role: membership.role ?? "",
              workspaceRole: resolveWorkspaceRole({
                storedRole: membership.role,
              }),
              workspaceType: membershipWorkspaceType,
              workspaceLabel: getWorkspaceTypeLabel(membershipWorkspaceType, {
                short: true,
              }),
              isCurrent: businessId === currentWorkspaceId,
            };
          })
          .filter(
            (workspace): workspace is NonNullable<typeof workspace> =>
              workspace !== null
          )
          .sort((left, right) => {
            if (left.isCurrent === right.isCurrent) {
              return left.name.localeCompare(right.name);
            }
            return left.isCurrent ? -1 : 1;
          });

    return NextResponse.json({
      ok: true,
      data: {
        id: verify.id,
        name: user.name ?? "Unknown User",
        email: user.email ?? "",
        photo: user.photo ?? "",
        role: verify.role,
        workspaceRole: verify.workspaceRole,
        permissions,
        effectivePermissions: permissions.sort(),
        permissionCatalog: getWorkspaceRolePermissionCatalog(),
        isWorkspaceOwner: isOwner,
        currentBusiness: {
          id: currentWorkspaceId ?? verify.businessId,
          name: isSuperAdminRole(verify.role)
            ? "Platform"
            : currentBusiness?.name ?? "Business",
        },
        businessName: isSuperAdminRole(verify.role)
          ? "Platform"
          : currentBusiness?.name ?? "Business",
        workspaceType,
        workspaceLabel: isSuperAdminRole(verify.role)
          ? "Platform"
          : getWorkspaceTypeLabel(workspaceType ?? DEFAULT_WORKSPACE_TYPE, {
              short: true,
            }),
        currentWorkspaceId,
        canUpgradeCurrentWorkspace:
          !isSuperAdminRole(verify.role) &&
          currentMembership?.role === WORKSPACE_ROLE.owner &&
          workspaceType === WORKSPACE_TYPE.INDIVIDUAL,
        workspaces,
        imageUrl: isSuperAdminRole(verify.role)
          ? ""
          : (currentBusiness?.logo ?? user.photo ?? ""),
      },
    });
  } catch (error) {
    return errorToNextResponse(error);
  }
}
