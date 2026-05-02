import {
  DEFAULT_WORKSPACE_ROLE_PERMISSIONS,
  PERMISSION,
  PERMISSION_DEFINITION_MAP,
  type PermissionKey,
} from "@/shared/auth/permission-registry";
import {
  isPlatformSuperAdminRole,
  resolveWorkspaceRole,
} from "@/shared/auth/roles";

export const WORKSPACE_PERMISSION = {
  VIEW_WORKSPACE_SETTINGS: PERMISSION.SETTINGS_VIEW,
  MANAGE_WORKSPACE_TEAM: PERMISSION.TEAM_ROLE_MANAGE,
  MANAGE_WORKSPACE_SECURITY: PERMISSION.SETTINGS_SECURITY_MANAGE,
  MANAGE_WORKSPACE_BILLING: PERMISSION.SETTINGS_PROFILE_MANAGE,
  VIEW_WORKSPACE_REPORTS: PERMISSION.REPORTS_VIEW,
  VIEW_PROPERTIES: PERMISSION.PROPERTIES_VIEW,
  MANAGE_PROPERTIES: PERMISSION.PROPERTIES_EDIT,
  VIEW_UNITS: PERMISSION.UNITS_VIEW,
  MANAGE_UNITS: PERMISSION.UNITS_EDIT,
  VIEW_TICKETS: PERMISSION.TICKETS_VIEW,
  MANAGE_TICKETS: PERMISSION.TICKETS_EDIT,
  ASSIGN_TICKETS: PERMISSION.TICKETS_ASSIGN,
  VIEW_TEAM: PERMISSION.TEAM_VIEW,
  MANAGE_TEAM: PERMISSION.TEAM_ROLE_MANAGE,
  VIEW_CHAT: PERMISSION.CHAT_VIEW,
  SEND_CHAT: PERMISSION.CHAT_SEND,
} as const;

export type WorkspacePermission =
  (typeof WORKSPACE_PERMISSION)[keyof typeof WORKSPACE_PERMISSION];

export type WorkspacePermissionMap = Record<WorkspacePermission, boolean>;

type WorkspacePermissionSubject = {
  platformRole?: string | null;
  workspaceRole?: string | null;
  directPermissions?: readonly (PermissionKey | string)[] | null;
  isWorkspaceOwner?: boolean;
};

function resolveStaticWorkspacePermissions(
  subject: WorkspacePermissionSubject
) {
  if (isPlatformSuperAdminRole(subject.platformRole)) {
    return new Set(PERMISSION_DEFINITION_MAP.keys());
  }

  if (subject.directPermissions?.length) {
    return new Set(
      subject.directPermissions.filter((permission): permission is PermissionKey =>
        PERMISSION_DEFINITION_MAP.has(permission as PermissionKey)
      )
    );
  }

  const workspaceRole = resolveWorkspaceRole({
    storedRole: subject.workspaceRole,
    isWorkspaceOwner: subject.isWorkspaceOwner,
  });

  return new Set(
    workspaceRole ? DEFAULT_WORKSPACE_ROLE_PERMISSIONS[workspaceRole] : []
  );
}

export function getWorkspacePermissionMap(subject: WorkspacePermissionSubject) {
  const permissions = resolveStaticWorkspacePermissions(subject);
  return Object.values(WORKSPACE_PERMISSION).reduce(
    (map, permission) => ({
      ...map,
      [permission]: permissions.has(permission),
    }),
    {} as WorkspacePermissionMap
  );
}

export function hasWorkspacePermission(
  subject: WorkspacePermissionSubject,
  permission: PermissionKey
) {
  return resolveStaticWorkspacePermissions(subject).has(permission);
}
