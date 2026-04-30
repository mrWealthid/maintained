import { ApiError } from "@/lib/errors/apiError";
import {
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
import { DEFAULT_WORKSPACE_ROLE_PERMISSIONS } from "@/shared/auth/permission-registry";

/**
 * Effective-permission resolution. The current minimum-viable implementation
 * resolves permissions purely from the user's workspace role using the static
 * defaults in the permission registry. Phase 2 of the migration introduces
 * a `RoleDefinition` Mongoose model and `UserPermissionOverride` model so
 * workspaces can configure their own role permission sets and grant direct
 * overrides per member.
 *
 * Until then this helper is the single point that route handlers and UI
 * gating call into, so swapping the source of truth is a one-file change.
 */

export type PermissionContext = {
  platformRole?: PLATFORM_ROLE | string | null;
  workspaceRole?: WORKSPACE_ROLE | string | null;
  isWorkspaceOwner?: boolean;
  /**
   * Optional explicit override list. When present, supersedes role defaults
   * (used by the future UserPermissionOverride model).
   */
  directPermissions?: readonly (PermissionKey | string)[] | null;
};

export function resolveEffectivePermissions(
  ctx: PermissionContext,
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

export function hasPermission(
  ctx: PermissionContext,
  key: PermissionKey,
): boolean {
  return resolveEffectivePermissions(ctx).has(key);
}

export function assertPermission(
  ctx: PermissionContext,
  key: PermissionKey,
  message = "You do not have permission to perform this action.",
): void {
  if (!hasPermission(ctx, key)) {
    throw ApiError.forbidden(message);
  }
}

export function assertAnyPermission(
  ctx: PermissionContext,
  keys: readonly PermissionKey[],
  message = "You do not have permission to perform this action.",
): void {
  const effective = resolveEffectivePermissions(ctx);
  for (const key of keys) {
    if (effective.has(key)) return;
  }
  throw ApiError.forbidden(message);
}
