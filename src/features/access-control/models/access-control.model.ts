import { z } from "zod";

import {
  isWorkspaceManageablePermissionKey,
  type PermissionKey,
} from "@/shared/auth/permission-registry";
import {
  WORKSPACE_ASSIGNABLE_ROLE_VALUES,
  type AssignableWorkspaceRole,
} from "@/shared/auth/roles";
import { PERMISSION_OVERRIDE_EFFECT } from "@/models/userPermissionOverrideModel";

const WorkspacePermissionKeySchema = z
  .string()
  .trim()
  .refine(isWorkspaceManageablePermissionKey, "Invalid permission key")
  .transform((value) => value as PermissionKey);

export const WorkspaceRoleDefinitionPayloadSchema = z.object({
  name: z.string().trim().min(2, "Role name is required").max(120),
  description: z.string().trim().max(500).optional().default(""),
  legacyRole: z.enum(WORKSPACE_ASSIGNABLE_ROLE_VALUES),
  permissions: z.array(WorkspacePermissionKeySchema).default([]),
});

export const TeamMemberPermissionOverridePayloadSchema = z.object({
  overrides: z
    .array(
      z.object({
        permission: WorkspacePermissionKeySchema,
        effect: z.enum([
          PERMISSION_OVERRIDE_EFFECT.allow,
          PERMISSION_OVERRIDE_EFFECT.deny,
        ]),
        reason: z.string().trim().max(500).optional().default(""),
        expiresAt: z.string().datetime().nullable().optional().default(null),
      })
    )
    .default([]),
});

export type WorkspaceRoleDefinitionPayload = z.infer<
  typeof WorkspaceRoleDefinitionPayloadSchema
>;

export type TeamMemberPermissionOverridePayload = z.infer<
  typeof TeamMemberPermissionOverridePayloadSchema
>;

export type TeamWorkspaceRoleDefinition = {
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

export type TeamPermissionCatalogSection = {
  id: string;
  title: string;
  scope: string;
  permissions: Array<{
    key: PermissionKey;
    scope: string;
    group: string;
    label: string;
    description: string;
    riskLevel: string;
    dependsOn: PermissionKey[];
  }>;
};

export type TeamRolesResponse = {
  roles: TeamWorkspaceRoleDefinition[];
  permissionCatalog: TeamPermissionCatalogSection[];
};

export type TeamMemberPermissionOverrideRecord = {
  id: string;
  permission: PermissionKey;
  effect: (typeof PERMISSION_OVERRIDE_EFFECT)[keyof typeof PERMISSION_OVERRIDE_EFFECT];
  reason: string;
  expiresAt: string | null;
  createdAt: string;
};

export type TeamMemberPermissionsResponse = {
  effectivePermissions: PermissionKey[];
  directOverrides: TeamMemberPermissionOverrideRecord[];
};
