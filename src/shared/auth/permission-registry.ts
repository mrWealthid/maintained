import { PLATFORM_ROLE, WORKSPACE_ROLE } from "@/shared/auth/roles";

/**
 * Permission registry for the Maintain property-maintenance app.
 *
 * Two scopes:
 *   platform.*  – system-wide capabilities (super admin)
 *   workspace.* – capabilities scoped to a property-management workspace
 *
 * Every behaviour-controlling check should reference one of these keys
 * rather than a raw role string. New features must add a key here first.
 */

export const PERMISSION_SCOPE = {
  platform: "platform",
  workspace: "workspace",
} as const;

export type PermissionScope =
  (typeof PERMISSION_SCOPE)[keyof typeof PERMISSION_SCOPE];

export const PERMISSION_RISK_LEVEL = {
  low: "low",
  medium: "medium",
  high: "high",
} as const;

export type PermissionRiskLevel =
  (typeof PERMISSION_RISK_LEVEL)[keyof typeof PERMISSION_RISK_LEVEL];

export type PermissionDefinition = {
  key: PermissionKey;
  scope: PermissionScope;
  group: string;
  label: string;
  description: string;
  riskLevel: PermissionRiskLevel;
  dependsOn?: PermissionKey[];
};

export const PERMISSION = {
  // ---- Platform ---------------------------------------------------------
  PLATFORM_DASHBOARD_VIEW: "platform.dashboard.view",
  PLATFORM_WORKSPACES_VIEW: "platform.workspaces.view",
  PLATFORM_WORKSPACES_MANAGE: "platform.workspaces.manage",
  PLATFORM_WORKSPACES_STATUS_MANAGE: "platform.workspaces.status.manage",
  PLATFORM_REPORTS_VIEW: "platform.reports.view",
  PLATFORM_SETTINGS_VIEW: "platform.settings.view",
  PLATFORM_SETTINGS_MANAGE: "platform.settings.manage",
  PLATFORM_EMAIL_MANAGE: "platform.email.manage",

  // ---- Workspace shell --------------------------------------------------
  WORKSPACE_DASHBOARD_VIEW: "workspace.dashboard.view",
  WORKSPACE_DASHBOARD_ANALYTICS_VIEW: "workspace.dashboard.analytics.view",
  WORKSPACE_SWITCH: "workspace.switch",

  // ---- Properties -------------------------------------------------------
  PROPERTIES_VIEW: "properties.view",
  PROPERTIES_CREATE: "properties.create",
  PROPERTIES_EDIT: "properties.edit",
  PROPERTIES_DELETE: "properties.delete",

  // ---- Units ------------------------------------------------------------
  UNITS_VIEW: "units.view",
  UNITS_CREATE: "units.create",
  UNITS_EDIT: "units.edit",
  UNITS_DELETE: "units.delete",
  UNITS_TENANT_ASSIGN: "units.tenant.assign",

  // ---- Tickets (work orders) -------------------------------------------
  TICKETS_VIEW: "tickets.view",
  TICKETS_PRIVATE_DATA_VIEW: "tickets.private_data.view",
  TICKETS_CREATE: "tickets.create",
  TICKETS_EDIT: "tickets.edit",
  TICKETS_ASSIGN: "tickets.assign",
  TICKETS_STATUS_MANAGE: "tickets.status.manage",
  TICKETS_TYPE_MANAGE: "tickets.type.manage",
  TICKETS_DECLINE: "tickets.decline",
  TICKETS_DELETE: "tickets.delete",
  TICKETS_MESSAGE: "tickets.message",
  TICKETS_EXPORT: "tickets.export",

  // ---- Technician requests ---------------------------------------------
  TECHNICIAN_REQUESTS_VIEW: "technician_requests.view",
  TECHNICIAN_REQUESTS_CREATE: "technician_requests.create",
  TECHNICIAN_REQUESTS_MANAGE: "technician_requests.manage",
  TECHNICIAN_REQUESTS_RESPOND: "technician_requests.respond",

  // ---- Ticket taxonomy --------------------------------------------------
  TICKET_CATEGORIES_VIEW: "ticket_categories.view",
  TICKET_CATEGORIES_MANAGE: "ticket_categories.manage",
  TICKET_TYPES_VIEW: "ticket_types.view",
  TICKET_TYPES_MANAGE: "ticket_types.manage",

  // ---- Tenants ----------------------------------------------------------
  TENANTS_VIEW: "tenants.view",
  TENANTS_PRIVATE_DATA_VIEW: "tenants.private_data.view",
  TENANTS_INVITE: "tenants.invite",
  TENANTS_MANAGE: "tenants.manage",
  TENANTS_REMOVE: "tenants.remove",
  TENANTS_MESSAGE: "tenants.message",

  // ---- Technicians (as actors in the workspace) -------------------------
  TECHNICIANS_VIEW: "technicians.view",
  TECHNICIANS_INVITE: "technicians.invite",
  TECHNICIANS_MANAGE: "technicians.manage",
  TECHNICIANS_REMOVE: "technicians.remove",

  // ---- Team (workspace staff) ------------------------------------------
  TEAM_VIEW: "team.view",
  TEAM_INVITE: "team.invite",
  TEAM_ROLE_MANAGE: "team.role.manage",
  TEAM_PERMISSION_MANAGE: "team.permission.manage",
  TEAM_STATUS_MANAGE: "team.status.manage",
  TEAM_REMOVE: "team.remove",
  TEAM_MESSAGE: "team.message",

  // ---- Chat -------------------------------------------------------------
  CHAT_VIEW: "chat.view",
  CHAT_SEND: "chat.send",

  // ---- Reports ----------------------------------------------------------
  REPORTS_VIEW: "reports.view",
  REPORTS_GENERATE: "reports.generate",
  REPORTS_DOWNLOAD: "reports.download",
  REPORTS_EXPORT: "reports.export",

  // ---- Settings ---------------------------------------------------------
  SETTINGS_VIEW: "settings.view",
  SETTINGS_PROFILE_MANAGE: "settings.profile.manage",
  SETTINGS_BRANDING_MANAGE: "settings.branding.manage",
  SETTINGS_NOTIFICATIONS_MANAGE: "settings.notifications.manage",
  SETTINGS_EMAIL_MANAGE: "settings.email.manage",
  SETTINGS_SECURITY_MANAGE: "settings.security.manage",
  SETTINGS_SESSIONS_VIEW: "settings.sessions.view",
  SETTINGS_SESSIONS_REVOKE: "settings.sessions.revoke",
} as const;

export type PermissionKey = (typeof PERMISSION)[keyof typeof PERMISSION];

const platformPermission = (
  key: PermissionKey,
  group: string,
  label: string,
  description: string,
  riskLevel: PermissionRiskLevel,
): PermissionDefinition => ({
  key,
  scope: PERMISSION_SCOPE.platform,
  group,
  label,
  description,
  riskLevel,
});

const workspacePermission = (
  key: PermissionKey,
  group: string,
  label: string,
  description: string,
  riskLevel: PermissionRiskLevel,
  dependsOn?: PermissionKey[],
): PermissionDefinition => ({
  key,
  scope: PERMISSION_SCOPE.workspace,
  group,
  label,
  description,
  riskLevel,
  dependsOn,
});

export const PERMISSION_DEFINITIONS = [
  // Platform
  platformPermission(
    PERMISSION.PLATFORM_DASHBOARD_VIEW,
    "Platform",
    "View platform dashboard",
    "View platform-level dashboard metrics and overview cards.",
    PERMISSION_RISK_LEVEL.low,
  ),
  platformPermission(
    PERMISSION.PLATFORM_WORKSPACES_VIEW,
    "Platform",
    "View workspaces",
    "View the platform workspace list and workspace details.",
    PERMISSION_RISK_LEVEL.low,
  ),
  platformPermission(
    PERMISSION.PLATFORM_WORKSPACES_MANAGE,
    "Platform",
    "Manage workspaces",
    "Create, edit, and administratively manage workspaces.",
    PERMISSION_RISK_LEVEL.high,
  ),
  platformPermission(
    PERMISSION.PLATFORM_WORKSPACES_STATUS_MANAGE,
    "Platform",
    "Activate or deactivate workspaces",
    "Activate, deactivate, and bulk-update workspace availability.",
    PERMISSION_RISK_LEVEL.high,
  ),
  platformPermission(
    PERMISSION.PLATFORM_REPORTS_VIEW,
    "Platform",
    "View platform reports",
    "View platform-wide reporting and analytics.",
    PERMISSION_RISK_LEVEL.medium,
  ),
  platformPermission(
    PERMISSION.PLATFORM_SETTINGS_VIEW,
    "Platform Settings",
    "View platform settings",
    "View app-wide platform settings.",
    PERMISSION_RISK_LEVEL.low,
  ),
  platformPermission(
    PERMISSION.PLATFORM_SETTINGS_MANAGE,
    "Platform Settings",
    "Manage platform settings",
    "Update app-wide platform settings.",
    PERMISSION_RISK_LEVEL.high,
  ),
  platformPermission(
    PERMISSION.PLATFORM_EMAIL_MANAGE,
    "Platform Settings",
    "Manage platform email",
    "Configure platform sender identity and app email templates.",
    PERMISSION_RISK_LEVEL.high,
  ),

  // Workspace shell
  workspacePermission(
    PERMISSION.WORKSPACE_DASHBOARD_VIEW,
    "Dashboard",
    "View dashboard",
    "View workspace dashboard overview sections.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.WORKSPACE_DASHBOARD_ANALYTICS_VIEW,
    "Dashboard",
    "View dashboard analytics",
    "View charts, KPIs, and live activity on the dashboard.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.WORKSPACE_DASHBOARD_VIEW],
  ),
  workspacePermission(
    PERMISSION.WORKSPACE_SWITCH,
    "Workspace",
    "Switch workspace",
    "Switch into another workspace where the user is a member.",
    PERMISSION_RISK_LEVEL.low,
  ),

  // Properties
  workspacePermission(
    PERMISSION.PROPERTIES_VIEW,
    "Properties",
    "View properties",
    "View property list and property detail pages.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.PROPERTIES_CREATE,
    "Properties",
    "Create properties",
    "Create new properties for the workspace.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.PROPERTIES_VIEW],
  ),
  workspacePermission(
    PERMISSION.PROPERTIES_EDIT,
    "Properties",
    "Edit properties",
    "Edit property details, address, and configuration.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.PROPERTIES_VIEW],
  ),
  workspacePermission(
    PERMISSION.PROPERTIES_DELETE,
    "Properties",
    "Delete properties",
    "Delete properties from the workspace.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.PROPERTIES_EDIT],
  ),

  // Units
  workspacePermission(
    PERMISSION.UNITS_VIEW,
    "Units",
    "View units",
    "View unit list and unit detail pages.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.UNITS_CREATE,
    "Units",
    "Create units",
    "Create new units under a property.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.UNITS_VIEW],
  ),
  workspacePermission(
    PERMISSION.UNITS_EDIT,
    "Units",
    "Edit units",
    "Edit unit label, floor, status, and metadata.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.UNITS_VIEW],
  ),
  workspacePermission(
    PERMISSION.UNITS_DELETE,
    "Units",
    "Delete units",
    "Delete units from a property.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.UNITS_EDIT],
  ),
  workspacePermission(
    PERMISSION.UNITS_TENANT_ASSIGN,
    "Units",
    "Assign tenants to units",
    "Set or change the tenant occupant of a unit.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.UNITS_EDIT],
  ),

  // Tickets
  workspacePermission(
    PERMISSION.TICKETS_VIEW,
    "Tickets",
    "View tickets",
    "View ticket lists and ticket detail records.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.TICKETS_PRIVATE_DATA_VIEW,
    "Tickets",
    "View ticket private data",
    "View tenant contact information attached to tickets.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.TICKETS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TICKETS_CREATE,
    "Tickets",
    "Create tickets",
    "Create new tickets / work orders.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.TICKETS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TICKETS_EDIT,
    "Tickets",
    "Edit tickets",
    "Edit ticket details, description, area, and metadata.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TICKETS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TICKETS_ASSIGN,
    "Tickets",
    "Assign tickets",
    "Assign or reassign tickets to technicians.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TICKETS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TICKETS_STATUS_MANAGE,
    "Tickets",
    "Manage ticket status",
    "Move tickets through their status lifecycle (processing, scheduled, completed, etc.).",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TICKETS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TICKETS_TYPE_MANAGE,
    "Tickets",
    "Change ticket type / category",
    "Reclassify a ticket's category or type.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.TICKETS_EDIT],
  ),
  workspacePermission(
    PERMISSION.TICKETS_DECLINE,
    "Tickets",
    "Decline tickets",
    "Decline a ticket and record a reason.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TICKETS_STATUS_MANAGE],
  ),
  workspacePermission(
    PERMISSION.TICKETS_DELETE,
    "Tickets",
    "Delete tickets",
    "Delete a ticket from the workspace.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TICKETS_EDIT],
  ),
  workspacePermission(
    PERMISSION.TICKETS_MESSAGE,
    "Tickets",
    "Message in ticket chat",
    "Participate in ticket chat rooms.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.TICKETS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TICKETS_EXPORT,
    "Tickets",
    "Export tickets",
    "Export ticket rows or generate ticket reports.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TICKETS_VIEW],
  ),

  // Technician requests
  workspacePermission(
    PERMISSION.TECHNICIAN_REQUESTS_VIEW,
    "Technician Requests",
    "View technician requests",
    "View technician request lists and detail records.",
    PERMISSION_RISK_LEVEL.low,
    [PERMISSION.TICKETS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TECHNICIAN_REQUESTS_CREATE,
    "Technician Requests",
    "Create technician requests",
    "Send technician requests for a ticket.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.TECHNICIAN_REQUESTS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TECHNICIAN_REQUESTS_MANAGE,
    "Technician Requests",
    "Manage technician requests",
    "Select, reassign, or cancel technician requests.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TECHNICIAN_REQUESTS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TECHNICIAN_REQUESTS_RESPOND,
    "Technician Requests",
    "Respond to technician requests",
    "Apply, decline, or quote on technician requests directed at the user.",
    PERMISSION_RISK_LEVEL.medium,
  ),

  // Ticket taxonomy
  workspacePermission(
    PERMISSION.TICKET_CATEGORIES_VIEW,
    "Ticket Taxonomy",
    "View ticket categories",
    "View ticket category options.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.TICKET_CATEGORIES_MANAGE,
    "Ticket Taxonomy",
    "Manage ticket categories",
    "Create and update workspace ticket categories.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.TICKET_CATEGORIES_VIEW],
  ),
  workspacePermission(
    PERMISSION.TICKET_TYPES_VIEW,
    "Ticket Taxonomy",
    "View ticket types",
    "View ticket type options.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.TICKET_TYPES_MANAGE,
    "Ticket Taxonomy",
    "Manage ticket types",
    "Create and update workspace ticket types.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.TICKET_TYPES_VIEW],
  ),

  // Tenants
  workspacePermission(
    PERMISSION.TENANTS_VIEW,
    "Tenants",
    "View tenants",
    "View the tenant directory and assignment history.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.TENANTS_PRIVATE_DATA_VIEW,
    "Tenants",
    "View tenant private data",
    "View tenant email, phone, and personal contact data.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.TENANTS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TENANTS_INVITE,
    "Tenants",
    "Invite tenants",
    "Send onboarding invitations to tenants.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TENANTS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TENANTS_MANAGE,
    "Tenants",
    "Manage tenants",
    "Edit tenant assignments, deactivate, and resend invites.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TENANTS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TENANTS_REMOVE,
    "Tenants",
    "Remove tenants",
    "Remove a tenant from the workspace.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TENANTS_MANAGE],
  ),
  workspacePermission(
    PERMISSION.TENANTS_MESSAGE,
    "Tenants",
    "Message tenants",
    "Send broadcast or transactional messages to tenants.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.TENANTS_VIEW],
  ),

  // Technicians
  workspacePermission(
    PERMISSION.TECHNICIANS_VIEW,
    "Technicians",
    "View technicians",
    "View the technician directory and specialties.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.TECHNICIANS_INVITE,
    "Technicians",
    "Invite technicians",
    "Send onboarding invitations to technicians.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TECHNICIANS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TECHNICIANS_MANAGE,
    "Technicians",
    "Manage technicians",
    "Edit technician profiles, specialties, and availability.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TECHNICIANS_VIEW],
  ),
  workspacePermission(
    PERMISSION.TECHNICIANS_REMOVE,
    "Technicians",
    "Remove technicians",
    "Remove a technician from the workspace.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TECHNICIANS_MANAGE],
  ),

  // Team
  workspacePermission(
    PERMISSION.TEAM_VIEW,
    "Team",
    "View team",
    "View workspace staff and pending invitations.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.TEAM_INVITE,
    "Team",
    "Invite team",
    "Invite users into the workspace as staff.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TEAM_VIEW],
  ),
  workspacePermission(
    PERMISSION.TEAM_ROLE_MANAGE,
    "Team",
    "Manage team roles",
    "Change workspace roles assigned to team members.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TEAM_VIEW],
  ),
  workspacePermission(
    PERMISSION.TEAM_PERMISSION_MANAGE,
    "Team",
    "Manage team permissions",
    "Grant or revoke direct permissions for team members.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TEAM_VIEW],
  ),
  workspacePermission(
    PERMISSION.TEAM_STATUS_MANAGE,
    "Team",
    "Activate or deactivate team",
    "Suspend or reactivate workspace team members.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TEAM_VIEW],
  ),
  workspacePermission(
    PERMISSION.TEAM_REMOVE,
    "Team",
    "Remove team",
    "Remove a member or revoke a pending invitation.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.TEAM_VIEW],
  ),
  workspacePermission(
    PERMISSION.TEAM_MESSAGE,
    "Team",
    "Message team",
    "Send email messages to selected team members.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.TEAM_VIEW],
  ),

  // Chat
  workspacePermission(
    PERMISSION.CHAT_VIEW,
    "Chat",
    "View chat rooms",
    "Access ticket chat rooms the user participates in.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.CHAT_SEND,
    "Chat",
    "Send chat messages",
    "Post messages and read receipts in ticket chat rooms.",
    PERMISSION_RISK_LEVEL.low,
    [PERMISSION.CHAT_VIEW],
  ),

  // Reports
  workspacePermission(
    PERMISSION.REPORTS_VIEW,
    "Reports",
    "View reports",
    "View the reports hub and recent runs.",
    PERMISSION_RISK_LEVEL.medium,
  ),
  workspacePermission(
    PERMISSION.REPORTS_GENERATE,
    "Reports",
    "Generate reports",
    "Generate property, ticket, and operational reports.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.REPORTS_VIEW],
  ),
  workspacePermission(
    PERMISSION.REPORTS_DOWNLOAD,
    "Reports",
    "Download reports",
    "Download stored report artifacts.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.REPORTS_VIEW],
  ),
  workspacePermission(
    PERMISSION.REPORTS_EXPORT,
    "Reports",
    "Export table data",
    "Generate certified table export PDFs.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.REPORTS_VIEW],
  ),

  // Settings
  workspacePermission(
    PERMISSION.SETTINGS_VIEW,
    "Settings",
    "View settings",
    "View workspace settings.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.SETTINGS_PROFILE_MANAGE,
    "Settings",
    "Manage workspace profile",
    "Update workspace name, logo, description, and address.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.SETTINGS_VIEW],
  ),
  workspacePermission(
    PERMISSION.SETTINGS_BRANDING_MANAGE,
    "Settings",
    "Manage branding",
    "Update workspace branding settings.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.SETTINGS_VIEW],
  ),
  workspacePermission(
    PERMISSION.SETTINGS_NOTIFICATIONS_MANAGE,
    "Settings",
    "Manage notifications",
    "Update notification preferences for the workspace.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.SETTINGS_VIEW],
  ),
  workspacePermission(
    PERMISSION.SETTINGS_EMAIL_MANAGE,
    "Settings",
    "Manage email settings",
    "Update sender identity, reply routing, and workspace email templates.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.SETTINGS_VIEW],
  ),
  workspacePermission(
    PERMISSION.SETTINGS_SECURITY_MANAGE,
    "Settings",
    "Manage security settings",
    "Update password policy, session policy, and related controls.",
    PERMISSION_RISK_LEVEL.high,
    [PERMISSION.SETTINGS_VIEW],
  ),
  workspacePermission(
    PERMISSION.SETTINGS_SESSIONS_VIEW,
    "Settings",
    "View sessions",
    "View active sessions for the current user.",
    PERMISSION_RISK_LEVEL.low,
  ),
  workspacePermission(
    PERMISSION.SETTINGS_SESSIONS_REVOKE,
    "Settings",
    "Revoke sessions",
    "Revoke active sessions for the current user.",
    PERMISSION_RISK_LEVEL.medium,
    [PERMISSION.SETTINGS_SESSIONS_VIEW],
  ),
] as const satisfies readonly PermissionDefinition[];

export const PERMISSION_DEFINITION_MAP = new Map(
  PERMISSION_DEFINITIONS.map((permission) => [permission.key, permission]),
);

export const ALL_PERMISSION_KEYS = PERMISSION_DEFINITIONS.map(
  (permission) => permission.key,
);

export function isPermissionKey(value?: string | null): value is PermissionKey {
  return Boolean(
    value && PERMISSION_DEFINITION_MAP.has(value as PermissionKey),
  );
}

export const WORKSPACE_MANAGEABLE_PERMISSION_DEFINITIONS =
  PERMISSION_DEFINITIONS.filter(
    (permission) => permission.scope !== PERMISSION_SCOPE.platform,
  );

export const WORKSPACE_MANAGEABLE_PERMISSION_KEYS =
  WORKSPACE_MANAGEABLE_PERMISSION_DEFINITIONS.map(
    (permission) => permission.key,
  );

export function isWorkspaceManageablePermissionKey(
  value?: string | null,
): value is PermissionKey {
  if (!isPermissionKey(value)) return false;
  const definition = PERMISSION_DEFINITION_MAP.get(value);
  return definition?.scope !== PERMISSION_SCOPE.platform;
}

export function expandPermissionKeys(
  keys?: readonly (PermissionKey | string)[],
): PermissionKey[] {
  const expanded = new Set<PermissionKey>();

  function addPermission(permission: PermissionKey) {
    const definition = PERMISSION_DEFINITION_MAP.get(permission);
    if (!definition) return;
    for (const dependency of definition.dependsOn ?? []) {
      addPermission(dependency);
    }
    expanded.add(permission);
  }

  for (const key of keys ?? []) {
    if (!isPermissionKey(key)) continue;
    addPermission(key);
  }

  return Array.from(expanded);
}

export function getPermissionKeysByScope(scope: PermissionScope) {
  return PERMISSION_DEFINITIONS.filter(
    (permission) => permission.scope === scope,
  ).map((permission) => permission.key);
}

export function getPermissionDefinitionsByScope(scope: PermissionScope) {
  return PERMISSION_DEFINITIONS.filter(
    (permission) => permission.scope === scope,
  );
}

// ---- Default role -> permission mappings ----------------------------------

export const DEFAULT_PLATFORM_ROLE_PERMISSIONS: Record<
  PLATFORM_ROLE,
  PermissionKey[]
> = {
  [PLATFORM_ROLE.super_admin]: ALL_PERMISSION_KEYS,
};

const WORKSPACE_MEMBER_BASE_PERMISSIONS = [
  PERMISSION.WORKSPACE_DASHBOARD_VIEW,
  PERMISSION.WORKSPACE_SWITCH,
  PERMISSION.SETTINGS_VIEW,
  PERMISSION.SETTINGS_SESSIONS_VIEW,
  PERMISSION.SETTINGS_SESSIONS_REVOKE,
  PERMISSION.PROPERTIES_VIEW,
  PERMISSION.UNITS_VIEW,
  PERMISSION.TICKETS_VIEW,
  PERMISSION.TICKET_CATEGORIES_VIEW,
  PERMISSION.TICKET_TYPES_VIEW,
  PERMISSION.CHAT_VIEW,
  PERMISSION.CHAT_SEND,
] satisfies PermissionKey[];

const WORKSPACE_MAINTENANCE_COORDINATOR_PERMISSIONS = [
  ...WORKSPACE_MEMBER_BASE_PERMISSIONS,
  PERMISSION.WORKSPACE_DASHBOARD_ANALYTICS_VIEW,
  PERMISSION.TICKETS_PRIVATE_DATA_VIEW,
  PERMISSION.TICKETS_CREATE,
  PERMISSION.TICKETS_EDIT,
  PERMISSION.TICKETS_ASSIGN,
  PERMISSION.TICKETS_STATUS_MANAGE,
  PERMISSION.TICKETS_TYPE_MANAGE,
  PERMISSION.TICKETS_DECLINE,
  PERMISSION.TICKETS_MESSAGE,
  PERMISSION.TICKETS_EXPORT,
  PERMISSION.TECHNICIAN_REQUESTS_VIEW,
  PERMISSION.TECHNICIAN_REQUESTS_CREATE,
  PERMISSION.TECHNICIAN_REQUESTS_MANAGE,
  PERMISSION.TICKET_CATEGORIES_MANAGE,
  PERMISSION.TICKET_TYPES_MANAGE,
  PERMISSION.TECHNICIANS_VIEW,
  PERMISSION.TECHNICIANS_INVITE,
  PERMISSION.TECHNICIANS_MANAGE,
  PERMISSION.TENANTS_VIEW,
  PERMISSION.TENANTS_PRIVATE_DATA_VIEW,
  PERMISSION.TENANTS_MESSAGE,
  PERMISSION.REPORTS_VIEW,
  PERMISSION.REPORTS_GENERATE,
  PERMISSION.REPORTS_DOWNLOAD,
] satisfies PermissionKey[];

const WORKSPACE_ACCOUNTANT_PERMISSIONS = [
  ...WORKSPACE_MEMBER_BASE_PERMISSIONS,
  PERMISSION.WORKSPACE_DASHBOARD_ANALYTICS_VIEW,
  PERMISSION.TICKETS_PRIVATE_DATA_VIEW,
  PERMISSION.TICKETS_EXPORT,
  PERMISSION.TECHNICIAN_REQUESTS_VIEW,
  PERMISSION.TENANTS_VIEW,
  PERMISSION.TENANTS_PRIVATE_DATA_VIEW,
  PERMISSION.REPORTS_VIEW,
  PERMISSION.REPORTS_GENERATE,
  PERMISSION.REPORTS_DOWNLOAD,
  PERMISSION.REPORTS_EXPORT,
] satisfies PermissionKey[];

const WORKSPACE_ADMIN_PERMISSIONS = [
  ...getPermissionKeysByScope(PERMISSION_SCOPE.workspace),
] satisfies PermissionKey[];

export const DEFAULT_WORKSPACE_ROLE_PERMISSIONS: Record<
  WORKSPACE_ROLE,
  PermissionKey[]
> = {
  [WORKSPACE_ROLE.owner]: WORKSPACE_ADMIN_PERMISSIONS,
  [WORKSPACE_ROLE.property_manager]: WORKSPACE_ADMIN_PERMISSIONS,
  [WORKSPACE_ROLE.maintenance_coordinator]:
    WORKSPACE_MAINTENANCE_COORDINATOR_PERMISSIONS,
  [WORKSPACE_ROLE.accountant]: WORKSPACE_ACCOUNTANT_PERMISSIONS,
  [WORKSPACE_ROLE.member]: WORKSPACE_MEMBER_BASE_PERMISSIONS,
};
