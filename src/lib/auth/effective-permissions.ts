import mongoose from "mongoose";

import RoleDefinition, {
  ROLE_DEFINITION_STATUS,
} from "@/models/roleDefinitionModel";
import UserPermissionOverride from "@/models/userPermissionOverrideModel";
import { PERMISSION_OVERRIDE_EFFECT } from "@/shared/auth/permission-overrides";
import {
  ALL_PERMISSION_KEYS,
  DEFAULT_WORKSPACE_ROLE_PERMISSIONS,
  DEFAULT_USER_TYPE_PERMISSIONS,
  PERMISSION_DEFINITION_MAP,
  PERMISSION_SCOPE,
  expandPermissionKeys,
  type PermissionKey,
  type PermissionScope,
} from "@/shared/auth/permission-registry";
import {
  isPlatformSuperAdminRole,
  resolveWorkspaceRole,
  USER_TYPE_VALUES,
  type PLATFORM_ROLE,
  type WORKSPACE_ROLE,
} from "@/shared/auth/roles";
import { findActiveWorkspaceMembership } from "@/lib/tenancy/workspace-membership-access";

type EffectiveWorkspacePermissionSubject = {
  userId: string;
  businessId: string;
  platformRole?: PLATFORM_ROLE | string | null;
  workspaceRole?: WORKSPACE_ROLE | string | null;
};

type LeanRoleDefinition = {
  permissions?: PermissionKey[];
  status?: string | null;
};

type LeanMembership = {
  role?: WORKSPACE_ROLE | string | null;
  roleDefinition?: mongoose.Types.ObjectId | string | null;
};

type LeanPermissionOverride = {
  permission?: PermissionKey | string | null;
  effect?: string | null;
};

function objectIdOrNull(value?: string | mongoose.Types.ObjectId | null) {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
}

function normalizePermissionKeys(keys?: readonly (PermissionKey | string)[]) {
  return (keys ?? []).filter((key): key is PermissionKey =>
    PERMISSION_DEFINITION_MAP.has(key as PermissionKey)
  );
}

function addPermissions(
  set: Set<PermissionKey>,
  keys?: readonly (PermissionKey | string)[]
) {
  for (const key of normalizePermissionKeys(keys)) {
    for (const expanded of expandPermissionKeys([key])) {
      set.add(expanded);
    }
  }
}

function resolveUserType(role?: string | null) {
  return USER_TYPE_VALUES.find((value) => value === role) ?? null;
}

function applyOverrides(
  set: Set<PermissionKey>,
  denied: Set<PermissionKey>,
  overrides: LeanPermissionOverride[]
) {
  for (const override of overrides) {
    if (!override.permission) continue;
    const permission = override.permission as PermissionKey;
    if (!PERMISSION_DEFINITION_MAP.has(permission)) continue;

    if (override.effect === PERMISSION_OVERRIDE_EFFECT.deny) {
      denied.add(permission);
      set.delete(permission);
      continue;
    }

    if (!denied.has(permission)) {
      addPermissions(set, [permission]);
    }
  }
}

async function getActiveRoleDefinitionPermissions(
  roleDefinitionId?: string | mongoose.Types.ObjectId | null
) {
  const roleObjectId = objectIdOrNull(roleDefinitionId);
  if (!roleObjectId) return null;

  const roleDefinition = await RoleDefinition.findOne({
    _id: roleObjectId,
    status: ROLE_DEFINITION_STATUS.active,
  })
    .select("permissions status")
    .lean<LeanRoleDefinition | null>();

  return roleDefinition?.permissions ?? null;
}

async function getActiveOverrides(args: {
  userId: string;
  scope: PermissionScope;
  workspaceId?: string | null;
}) {
  const userObjectId = objectIdOrNull(args.userId);
  if (!userObjectId) return [];

  const now = new Date();
  return UserPermissionOverride.find({
    user: userObjectId,
    scope: args.scope,
    workspace: args.workspaceId ? objectIdOrNull(args.workspaceId) : null,
    revokedAt: null,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  })
    .select("permission effect")
    .lean<LeanPermissionOverride[]>();
}

async function getWorkspaceMembership(args: {
  userId: string;
  businessId: string;
}) {
  return findActiveWorkspaceMembership({
    userId: args.userId,
    workspaceId: args.businessId,
  }).lean<LeanMembership | null>();
}

export async function getEffectiveWorkspacePermissionSet(
  subject: EffectiveWorkspacePermissionSubject
) {
  const permissions = new Set<PermissionKey>();
  const denied = new Set<PermissionKey>();

  if (isPlatformSuperAdminRole(subject.platformRole)) {
    addPermissions(permissions, ALL_PERMISSION_KEYS);
    return permissions;
  }

  const [membership, workspaceOverrides] = await Promise.all([
    getWorkspaceMembership({
      userId: subject.userId,
      businessId: subject.businessId,
    }),
    getActiveOverrides({
      userId: subject.userId,
      scope: PERMISSION_SCOPE.workspace,
      workspaceId: subject.businessId,
    }),
  ]);

  const roleDefinitionPermissions = await getActiveRoleDefinitionPermissions(
    membership?.roleDefinition
  );

  if (roleDefinitionPermissions) {
    addPermissions(permissions, roleDefinitionPermissions);
  } else {
    const workspaceRole = resolveWorkspaceRole({
      storedRole: membership?.role ?? subject.workspaceRole,
    });

    if (workspaceRole) {
      addPermissions(
        permissions,
        DEFAULT_WORKSPACE_ROLE_PERMISSIONS[workspaceRole]
      );
    } else {
      const userType = resolveUserType(membership?.role ?? subject.workspaceRole);
      if (userType) {
        addPermissions(permissions, DEFAULT_USER_TYPE_PERMISSIONS[userType]);
      }
    }
  }

  applyOverrides(permissions, denied, workspaceOverrides);

  for (const deniedPermission of denied) {
    permissions.delete(deniedPermission);
  }

  return permissions;
}

export async function hasEffectiveWorkspacePermission(
  subject: EffectiveWorkspacePermissionSubject,
  permission: PermissionKey
) {
  const permissions = await getEffectiveWorkspacePermissionSet(subject);
  return permissions.has(permission);
}
