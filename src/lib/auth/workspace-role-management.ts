import mongoose from "mongoose";

import RoleDefinition, {
  ROLE_DEFINITION_STATUS,
  type IRoleDefinition,
} from "@/models/roleDefinitionModel";
import WorkspaceMembership from "@/models/workspaceMembershipModel";
import {
  PERMISSION_DEFINITIONS,
  PERMISSION_SCOPE,
  expandPermissionKeys,
  isWorkspaceManageablePermissionKey,
  type PermissionDefinition,
  type PermissionKey,
} from "@/shared/auth/permission-registry";
import {
  MEMBERSHIP_STATUS,
  WORKSPACE_ROLE,
  type AssignableWorkspaceRole,
} from "@/shared/auth/roles";

type ObjectIdLike = mongoose.Types.ObjectId | string;

type LeanWorkspaceRoleDefinition = Pick<
  IRoleDefinition,
  | "key"
  | "name"
  | "description"
  | "permissions"
  | "legacyRole"
  | "isSystem"
  | "isDefault"
  | "locked"
  | "status"
> & {
  _id: mongoose.Types.ObjectId;
};

export type WorkspaceRoleDefinitionSummary = {
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  legacyRole: AssignableWorkspaceRole;
  isSystem: boolean;
  isDefault: boolean;
  locked: boolean;
  status: string;
  memberCount: number;
};

function objectIdOrNull(value?: ObjectIdLike | null) {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
}

export function normalizeWorkspaceRolePermissions(
  keys?: readonly (PermissionKey | string)[]
) {
  return expandPermissionKeys(
    (keys ?? []).filter((key): key is PermissionKey =>
      isWorkspaceManageablePermissionKey(key)
    )
  );
}

export function getWorkspaceRolePermissionCatalog() {
  const definitions = PERMISSION_DEFINITIONS.filter(
    (permission) => permission.scope !== PERMISSION_SCOPE.platform
  );
  const sections = new Map<
    string,
    {
      id: string;
      title: string;
      scope: string;
      permissions: Array<PermissionDefinition & { dependsOn: PermissionKey[] }>;
    }
  >();

  for (const definition of definitions) {
    const id = `${definition.scope}:${definition.group
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    const existing = sections.get(id);
    const permission = {
      ...definition,
      dependsOn: [...(definition.dependsOn ?? [])],
    };

    if (existing) {
      existing.permissions.push(permission);
      continue;
    }

    sections.set(id, {
      id,
      title: definition.group,
      scope: definition.scope,
      permissions: [permission],
    });
  }

  return Array.from(sections.values());
}

async function getRoleMemberCounts(workspaceId: mongoose.Types.ObjectId) {
  const memberCounts = await WorkspaceMembership.aggregate<{
    _id: mongoose.Types.ObjectId;
    memberCount: number;
  }>([
    {
      $match: {
        workspace: workspaceId,
        status: MEMBERSHIP_STATUS.active,
        roleDefinition: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$roleDefinition",
        memberCount: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    memberCounts.map((item) => [item._id.toString(), item.memberCount])
  );
}

function toSummary(
  role: LeanWorkspaceRoleDefinition,
  memberCount: number
): WorkspaceRoleDefinitionSummary | null {
  const legacyRole = role.legacyRole;
  if (
    legacyRole !== WORKSPACE_ROLE.property_manager &&
    legacyRole !== WORKSPACE_ROLE.maintenance_coordinator &&
    legacyRole !== WORKSPACE_ROLE.accountant &&
    legacyRole !== WORKSPACE_ROLE.member
  ) {
    return null;
  }

  return {
    id: role._id.toString(),
    key: role.key,
    name: role.name,
    description: role.description ?? "",
    permissions: normalizeWorkspaceRolePermissions(role.permissions),
    legacyRole,
    isSystem: role.isSystem === true,
    isDefault: role.isDefault === true,
    locked: role.locked === true,
    status: role.status ?? ROLE_DEFINITION_STATUS.active,
    memberCount,
  };
}

export async function listActiveWorkspaceRoleDefinitions(args: {
  workspaceId: ObjectIdLike;
}) {
  const workspaceId = objectIdOrNull(args.workspaceId);
  if (!workspaceId) {
    return [] satisfies WorkspaceRoleDefinitionSummary[];
  }

  const [roleDefinitions, memberCountByRoleId] = await Promise.all([
    RoleDefinition.find({
      scope: PERMISSION_SCOPE.workspace,
      workspace: workspaceId,
      status: ROLE_DEFINITION_STATUS.active,
    })
      .sort({ locked: -1, isSystem: -1, name: 1 })
      .select(
        "key name description permissions legacyRole isSystem isDefault locked status"
      )
      .lean<LeanWorkspaceRoleDefinition[]>(),
    getRoleMemberCounts(workspaceId),
  ]);

  return roleDefinitions
    .map((role) =>
      toSummary(role, memberCountByRoleId.get(role._id.toString()) ?? 0)
    )
    .filter((role): role is WorkspaceRoleDefinitionSummary => Boolean(role));
}

export async function findActiveWorkspaceRoleDefinition(args: {
  workspaceId: ObjectIdLike;
  roleDefinitionId: ObjectIdLike;
}) {
  const workspaceId = objectIdOrNull(args.workspaceId);
  const roleDefinitionId = objectIdOrNull(args.roleDefinitionId);
  if (!workspaceId || !roleDefinitionId) {
    return null;
  }

  const roleDefinition = await RoleDefinition.findOne({
    _id: roleDefinitionId,
    scope: PERMISSION_SCOPE.workspace,
    workspace: workspaceId,
    status: ROLE_DEFINITION_STATUS.active,
  })
    .select(
      "key name description permissions legacyRole isSystem isDefault locked status"
    )
    .lean<LeanWorkspaceRoleDefinition | null>();

  if (!roleDefinition) return null;

  return toSummary(roleDefinition, 0);
}

export async function syncWorkspaceMembershipRoleAssignments(args: {
  workspaceId: ObjectIdLike;
  roleDefinitionId: ObjectIdLike;
  legacyRole: AssignableWorkspaceRole;
}) {
  const workspaceId = objectIdOrNull(args.workspaceId);
  const roleDefinitionId = objectIdOrNull(args.roleDefinitionId);
  if (!workspaceId || !roleDefinitionId) {
    return;
  }

  await WorkspaceMembership.updateMany(
    {
      workspace: workspaceId,
      roleDefinition: roleDefinitionId,
    },
    {
      $set: {
        role: args.legacyRole,
      },
    }
  );
}
