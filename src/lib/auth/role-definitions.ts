import mongoose from "mongoose";

import RoleDefinition, {
  ROLE_DEFINITION_STATUS,
} from "@/models/roleDefinitionModel";
import {
  DEFAULT_PLATFORM_ROLE_PERMISSIONS,
  DEFAULT_WORKSPACE_ROLE_PERMISSIONS,
  PERMISSION_SCOPE,
  type PermissionKey,
  type PermissionScope,
} from "@/shared/auth/permission-registry";
import {
  formatWorkspaceRoleLabel,
  PLATFORM_ROLE,
  WORKSPACE_ROLE,
  type AssignableWorkspaceRole,
} from "@/shared/auth/roles";

type ObjectIdLike = mongoose.Types.ObjectId | string;

type RoleDefinitionTemplate = {
  scope: PermissionScope;
  key: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  legacyRole?: AssignableWorkspaceRole;
  isDefault?: boolean;
  locked?: boolean;
};

type RoleSeedOptions = {
  session?: mongoose.ClientSession | null;
  createdBy?: ObjectIdLike | null;
};

function objectIdOrNull(value?: ObjectIdLike | null) {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
}

function workspaceRoleKey(role: WORKSPACE_ROLE) {
  return role.toLowerCase();
}

export function getWorkspaceRoleDefinitionKey(role: WORKSPACE_ROLE) {
  return workspaceRoleKey(role);
}

function getWorkspaceRoleDescription(role: WORKSPACE_ROLE) {
  switch (role) {
    case WORKSPACE_ROLE.owner:
      return "Full workspace owner permissions. Kept as a locked system role.";
    case WORKSPACE_ROLE.property_manager:
      return "Full property-management workspace administration permissions.";
    case WORKSPACE_ROLE.maintenance_coordinator:
      return "Ticket triage, technician assignment, and work-order operations.";
    case WORKSPACE_ROLE.accountant:
      return "Reporting and financial visibility permissions.";
    case WORKSPACE_ROLE.member:
    default:
      return "Baseline workspace visibility permissions.";
  }
}

export const PLATFORM_ROLE_DEFINITION_TEMPLATES: RoleDefinitionTemplate[] = [
  {
    scope: PERMISSION_SCOPE.platform,
    key: PLATFORM_ROLE.super_admin.toLowerCase(),
    name: "Super Admin",
    description: "Full platform access across every workspace and app setting.",
    permissions: DEFAULT_PLATFORM_ROLE_PERMISSIONS[PLATFORM_ROLE.super_admin],
    isDefault: true,
    locked: true,
  },
];

export const WORKSPACE_ROLE_DEFINITION_TEMPLATES: RoleDefinitionTemplate[] =
  Object.values(WORKSPACE_ROLE).map((role) => ({
    scope: PERMISSION_SCOPE.workspace,
    key: workspaceRoleKey(role),
    name: formatWorkspaceRoleLabel(role),
    description: getWorkspaceRoleDescription(role),
    permissions: DEFAULT_WORKSPACE_ROLE_PERMISSIONS[role],
    legacyRole:
      role === WORKSPACE_ROLE.owner ? WORKSPACE_ROLE.property_manager : role,
    isDefault: role === WORKSPACE_ROLE.member,
    locked: role === WORKSPACE_ROLE.owner,
  }));

async function upsertRoleDefinitions(args: {
  workspaceId?: ObjectIdLike | null;
  templates: RoleDefinitionTemplate[];
  options?: RoleSeedOptions;
}) {
  if (args.templates.length === 0) return;

  const workspaceId = objectIdOrNull(args.workspaceId);
  const actorId = objectIdOrNull(args.options?.createdBy);

  await RoleDefinition.bulkWrite(
    args.templates.map((template) => ({
      updateOne: {
        filter: {
          scope: template.scope,
          workspace: workspaceId,
          key: template.key,
        },
        update: {
          $set: {
            name: template.name,
            description: template.description,
            permissions: template.permissions,
            legacyRole: template.legacyRole ?? null,
            isSystem: true,
            isDefault: template.isDefault === true,
            locked: template.locked === true,
            status: ROLE_DEFINITION_STATUS.active,
            updatedBy: actorId,
          },
          $setOnInsert: {
            scope: template.scope,
            workspace: workspaceId,
            key: template.key,
            createdBy: actorId,
          },
        },
        upsert: true,
      },
    })),
    args.options?.session ? { session: args.options.session } : undefined
  );
}

export async function ensurePlatformRoleDefinitions(options?: RoleSeedOptions) {
  await upsertRoleDefinitions({
    templates: PLATFORM_ROLE_DEFINITION_TEMPLATES,
    options,
  });
}

export async function ensureWorkspaceRoleDefinitions(args: {
  workspaceId: ObjectIdLike;
  options?: RoleSeedOptions;
}) {
  await upsertRoleDefinitions({
    workspaceId: args.workspaceId,
    templates: WORKSPACE_ROLE_DEFINITION_TEMPLATES,
    options: args.options,
  });
}

export async function resolveWorkspaceRoleDefinitionId(args: {
  workspaceId: ObjectIdLike;
  role: WORKSPACE_ROLE;
  options?: RoleSeedOptions;
}) {
  await ensureWorkspaceRoleDefinitions({
    workspaceId: args.workspaceId,
    options: args.options,
  });

  const roleDefinition = await RoleDefinition.findOne({
    scope: PERMISSION_SCOPE.workspace,
    workspace: args.workspaceId,
    key: getWorkspaceRoleDefinitionKey(args.role),
    status: ROLE_DEFINITION_STATUS.active,
  })
    .select("_id")
    .session(args.options?.session ?? null);

  return roleDefinition?._id ?? null;
}
