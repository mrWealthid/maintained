import mongoose from "mongoose";

import RoleDefinition, {
  ROLE_DEFINITION_STATUS,
  type IRoleDefinition,
} from "@/models/roleDefinitionModel";
import {
  PERMISSION_DEFINITIONS,
  PERMISSION_SCOPE,
  expandPermissionKeys,
  isPlatformManageablePermissionKey,
  type PermissionDefinition,
  type PermissionKey,
} from "@/shared/auth/permission-registry";

type LeanPlatformRoleDefinition = Pick<
  IRoleDefinition,
  | "key"
  | "name"
  | "description"
  | "permissions"
  | "isSystem"
  | "isDefault"
  | "locked"
  | "status"
> & {
  _id: mongoose.Types.ObjectId;
};

export type PlatformRoleDefinitionSummary = {
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  isSystem: boolean;
  isDefault: boolean;
  locked: boolean;
  status: string;
};

export function normalizePlatformRolePermissions(
  keys?: readonly (PermissionKey | string)[]
) {
  return expandPermissionKeys(
    (keys ?? []).filter((key): key is PermissionKey =>
      isPlatformManageablePermissionKey(key)
    )
  );
}

export function getPlatformRolePermissionCatalog() {
  const definitions = PERMISSION_DEFINITIONS.filter(
    (permission) => permission.scope === PERMISSION_SCOPE.platform
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
    const permission = {
      ...definition,
      dependsOn: [...(definition.dependsOn ?? [])],
    };
    const existing = sections.get(id);

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

export async function listActivePlatformRoleDefinitions() {
  const roleDefinitions = await RoleDefinition.find({
    scope: PERMISSION_SCOPE.platform,
    workspace: null,
    status: ROLE_DEFINITION_STATUS.active,
  })
    .sort({ locked: -1, isSystem: -1, name: 1 })
    .select("key name description permissions isSystem isDefault locked status")
    .lean<LeanPlatformRoleDefinition[]>();

  return roleDefinitions.map((role) => ({
    id: role._id.toString(),
    key: role.key,
    name: role.name,
    description: role.description ?? "",
    permissions: normalizePlatformRolePermissions(role.permissions),
    isSystem: role.isSystem === true,
    isDefault: role.isDefault === true,
    locked: role.locked === true,
    status: role.status ?? ROLE_DEFINITION_STATUS.active,
  })) satisfies PlatformRoleDefinitionSummary[];
}
