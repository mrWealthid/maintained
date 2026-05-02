import type { VerifiedUser } from "@/lib/auth/getVerifiedUser";
import {
  getEffectiveWorkspacePermissionSet,
  hasEffectiveWorkspacePermission,
} from "@/lib/auth/effective-permissions";
import { ApiError } from "@/lib/errors/apiError";
import {
  DEFAULT_WORKSPACE_ROLE_PERMISSIONS,
  PERMISSION_DEFINITION_MAP,
  type PermissionKey,
  isPermissionKey,
} from "@/shared/auth/permission-registry";
import {
  PLATFORM_ROLE,
  WORKSPACE_ROLE,
  isPlatformSuperAdminRole,
  resolveWorkspaceRole,
} from "@/shared/auth/roles";

export type PermissionContext = {
  userId?: string | null;
  businessId?: string | null;
  platformRole?: PLATFORM_ROLE | string | null;
  workspaceRole?: WORKSPACE_ROLE | string | null;
  isWorkspaceOwner?: boolean;
  directPermissions?: readonly (PermissionKey | string)[] | null;
};

type PermissionGuardUser = Pick<
  VerifiedUser,
  "id" | "businessId" | "platformRole" | "workspaceRole"
>;

function getPermissionDeniedMessage(permission: PermissionKey) {
  return `You do not have permission to perform this action (${permission}).`;
}

export function resolveStaticPermissions(
  ctx: PermissionContext
): Set<PermissionKey> {
  if (isPlatformSuperAdminRole(ctx.platformRole)) {
    return new Set(PERMISSION_DEFINITION_MAP.keys());
  }

  if (ctx.directPermissions?.length) {
    const set = new Set<PermissionKey>();
    for (const key of ctx.directPermissions) {
      if (isPermissionKey(key)) set.add(key);
    }
    return set;
  }

  const role = resolveWorkspaceRole({
    storedRole: ctx.workspaceRole ?? undefined,
    isWorkspaceOwner: ctx.isWorkspaceOwner,
  });

  if (!role) return new Set();
  return new Set(DEFAULT_WORKSPACE_ROLE_PERMISSIONS[role] ?? []);
}

export async function resolveEffectivePermissions(
  ctx: PermissionContext
): Promise<Set<PermissionKey>> {
  if (ctx.userId && ctx.businessId) {
    return getEffectiveWorkspacePermissionSet({
      userId: ctx.userId,
      businessId: ctx.businessId,
      platformRole: ctx.platformRole,
      workspaceRole: ctx.workspaceRole,
    });
  }

  return resolveStaticPermissions(ctx);
}

export async function hasPermission(
  ctx: PermissionContext,
  key: PermissionKey
): Promise<boolean> {
  const effective = await resolveEffectivePermissions(ctx);
  return effective.has(key);
}

export async function assertPermission(
  ctx: PermissionContext,
  key: PermissionKey,
  message = getPermissionDeniedMessage(key)
): Promise<void> {
  if (!(await hasPermission(ctx, key))) {
    throw ApiError.forbidden(message);
  }
}

export async function assertAnyPermission(
  ctx: PermissionContext,
  keys: readonly PermissionKey[],
  message = "You do not have permission to perform this action."
): Promise<void> {
  const effective = await resolveEffectivePermissions(ctx);
  for (const key of keys) {
    if (effective.has(key)) return;
  }
  throw ApiError.forbidden(message);
}

export async function hasWorkspacePermissionKey(
  user: PermissionGuardUser,
  permission: PermissionKey
) {
  return hasEffectiveWorkspacePermission(
    {
      userId: user.id,
      businessId: user.businessId,
      platformRole: user.platformRole,
      workspaceRole: user.workspaceRole,
    },
    permission
  );
}

export async function assertWorkspacePermissionKey(
  user: PermissionGuardUser,
  permission: PermissionKey,
  message?: string
) {
  if (await hasWorkspacePermissionKey(user, permission)) {
    return;
  }

  throw ApiError.forbidden(message ?? getPermissionDeniedMessage(permission));
}

export async function assertLegacyWorkspacePermission(
  user: {
    id?: string | null;
    currentBusiness?: { toString(): string } | string | null;
    role?: string | null;
    isSuperAdminRole?: boolean;
  },
  permission: PermissionKey,
  message?: string
) {
  const workspaceRole =
    user.role === "USER" || user.role === "TECHNICIAN"
      ? WORKSPACE_ROLE.member
      : user.role;

  await assertPermission(
    {
      userId: user.id,
      businessId: user.currentBusiness?.toString(),
      platformRole: user.isSuperAdminRole ? PLATFORM_ROLE.super_admin : null,
      workspaceRole,
    },
    permission,
    message
  );
}
