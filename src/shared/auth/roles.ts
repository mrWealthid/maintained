import { ROLES } from "@/shared/enums/enums";

/**
 * Multi-tier role taxonomy for the Maintain property-maintenance app.
 *
 *  PLATFORM_ROLE   – system-wide roles (super admin)
 *  WORKSPACE_ROLE  – scoped to a property-management business / workspace
 *  USER_TYPE       – non-staff actors (tenants, technicians) preserved from
 *                    the legacy ROLES enum so existing tenant/technician
 *                    flows keep working without immediate refactor.
 */

export const MEMBERSHIP_STATUS = {
  active: "ACTIVE",
  suspended: "SUSPENDED",
} as const;

export type MembershipStatus =
  (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];

export const MEMBERSHIP_STATUS_VALUES = Object.values(MEMBERSHIP_STATUS);

export enum PLATFORM_ROLE {
  super_admin = "SUPER_ADMIN",
}

/**
 * Workspace = a property-management organisation (a `Business` in the DB).
 *
 *  owner                  – Property owner / account creator. Full control + billing.
 *  property_manager       – Day-to-day administrator (admin equivalent).
 *  maintenance_coordinator– Triages and assigns work orders, manages technicians.
 *  accountant             – Financial reporting, invoicing (finance equivalent).
 *  member                 – Read-only / basic staff.
 */
export enum WORKSPACE_ROLE {
  owner = "WORKSPACE_OWNER",
  property_manager = "PROPERTY_MANAGER",
  maintenance_coordinator = "MAINTENANCE_COORDINATOR",
  accountant = "ACCOUNTANT",
  member = "WORKSPACE_MEMBER",
}

export const WORKSPACE_ROLE_VALUES = Object.values(WORKSPACE_ROLE);

export const WORKSPACE_ASSIGNABLE_ROLE_VALUES = [
  WORKSPACE_ROLE.property_manager,
  WORKSPACE_ROLE.maintenance_coordinator,
  WORKSPACE_ROLE.accountant,
  WORKSPACE_ROLE.member,
] as const;

export type AssignableWorkspaceRole =
  (typeof WORKSPACE_ASSIGNABLE_ROLE_VALUES)[number];

/**
 * Non-staff actors. These users are members of a workspace but consume the
 * app from the resident or service-provider side.
 *
 *  tenant      – Resident of a unit. Can create work orders for their own unit.
 *  technician  – External or in-house tradesperson. Sees assigned tickets only.
 */
export enum USER_TYPE {
  tenant = "TENANT",
  technician = "TECHNICIAN",
}

export const USER_TYPE_VALUES = Object.values(USER_TYPE);

export function isPlatformSuperAdminRole(role?: string | null) {
  return role === PLATFORM_ROLE.super_admin || role === ROLES.super_admin;
}

/**
 * Map any stored role value (legacy ROLES enum, new WORKSPACE_ROLE enum, or
 * unknown) into the canonical workspace role taxonomy.
 *
 * Legacy mapping:
 *   ROLES.admin  -> WORKSPACE_ROLE.property_manager
 *   ROLES.owner  -> WORKSPACE_ROLE.owner       (when isWorkspaceOwner is true)
 *   ROLES.user   -> WORKSPACE_ROLE.member
 * Tenants and technicians are NOT workspace roles in the new model — see
 * USER_TYPE above. This resolver returns null for those.
 */
export function resolveWorkspaceRole(args: {
  storedRole?: string | null;
  isWorkspaceOwner?: boolean;
}): WORKSPACE_ROLE | null {
  if (args.isWorkspaceOwner) {
    return WORKSPACE_ROLE.owner;
  }

  switch (args.storedRole) {
    case WORKSPACE_ROLE.owner:
    case ROLES.owner:
      return WORKSPACE_ROLE.owner;
    case WORKSPACE_ROLE.property_manager:
    case ROLES.admin:
      return WORKSPACE_ROLE.property_manager;
    case WORKSPACE_ROLE.maintenance_coordinator:
      return WORKSPACE_ROLE.maintenance_coordinator;
    case WORKSPACE_ROLE.accountant:
      return WORKSPACE_ROLE.accountant;
    case WORKSPACE_ROLE.member:
      return WORKSPACE_ROLE.member;
    case USER_TYPE.tenant:
    case ROLES.user:
    case USER_TYPE.technician:
    case ROLES.technician:
      return null;
    default:
      return null;
  }
}

export function resolveAssignableWorkspaceRole(
  role?: string | null,
): AssignableWorkspaceRole {
  const workspaceRole = resolveWorkspaceRole({ storedRole: role });

  switch (workspaceRole) {
    case WORKSPACE_ROLE.property_manager:
      return WORKSPACE_ROLE.property_manager;
    case WORKSPACE_ROLE.maintenance_coordinator:
      return WORKSPACE_ROLE.maintenance_coordinator;
    case WORKSPACE_ROLE.accountant:
      return WORKSPACE_ROLE.accountant;
    default:
      return WORKSPACE_ROLE.member;
  }
}

const WORKSPACE_ROLE_LABELS: Record<WORKSPACE_ROLE, string> = {
  [WORKSPACE_ROLE.owner]: "Owner",
  [WORKSPACE_ROLE.property_manager]: "Property Manager",
  [WORKSPACE_ROLE.maintenance_coordinator]: "Maintenance Coordinator",
  [WORKSPACE_ROLE.accountant]: "Accountant",
  [WORKSPACE_ROLE.member]: "Member",
};

const USER_TYPE_LABELS: Record<USER_TYPE, string> = {
  [USER_TYPE.tenant]: "Tenant",
  [USER_TYPE.technician]: "Technician",
};

export function formatWorkspaceRoleLabel(role?: string | null): string {
  if (isPlatformSuperAdminRole(role)) {
    return "Super Admin";
  }

  const workspaceRole = resolveWorkspaceRole({ storedRole: role });
  if (workspaceRole) {
    return WORKSPACE_ROLE_LABELS[workspaceRole];
  }

  if (role === USER_TYPE.tenant || role === ROLES.user) {
    return USER_TYPE_LABELS[USER_TYPE.tenant];
  }
  if (role === USER_TYPE.technician || role === ROLES.technician) {
    return USER_TYPE_LABELS[USER_TYPE.technician];
  }

  return "Team member";
}

/**
 * Map a workspace/user role to the legacy ROLES value used by middleware,
 * dashboards, and existing API guards. Keeps backward compatibility while
 * the new WORKSPACE_ROLE enum is being rolled out.
 */
export function toLegacySessionRole(role?: string | null): ROLES | null {
  if (isPlatformSuperAdminRole(role)) {
    return ROLES.super_admin;
  }

  const workspaceRole = resolveWorkspaceRole({ storedRole: role });
  switch (workspaceRole) {
    case WORKSPACE_ROLE.owner:
      return ROLES.owner;
    case WORKSPACE_ROLE.property_manager:
    case WORKSPACE_ROLE.maintenance_coordinator:
      return ROLES.admin;
    case WORKSPACE_ROLE.accountant:
    case WORKSPACE_ROLE.member:
      return ROLES.user;
    default:
      break;
  }

  if (role === USER_TYPE.tenant || role === ROLES.user) {
    return ROLES.user;
  }
  if (role === USER_TYPE.technician || role === ROLES.technician) {
    return ROLES.technician;
  }

  return null;
}

export function isWorkspaceAdminRole(role?: string | null) {
  const workspaceRole = resolveWorkspaceRole({ storedRole: role });
  return (
    workspaceRole === WORKSPACE_ROLE.owner ||
    workspaceRole === WORKSPACE_ROLE.property_manager
  );
}

export function isWorkspaceMemberRole(role?: string | null) {
  return resolveWorkspaceRole({ storedRole: role }) !== null;
}
