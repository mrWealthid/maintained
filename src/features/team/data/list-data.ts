import {
  WORKSPACE_ROLE,
  WORKSPACE_ASSIGNABLE_ROLE_VALUES,
  formatWorkspaceRoleLabel,
  type AssignableWorkspaceRole,
} from "@/shared/auth/roles";

export type WorkspaceRoleMeta = {
  label: string;
  className: string;
  description: string;
};

export const WORKSPACE_ROLE_META: Record<WORKSPACE_ROLE, WorkspaceRoleMeta> = {
  [WORKSPACE_ROLE.owner]: {
    label: formatWorkspaceRoleLabel(WORKSPACE_ROLE.owner),
    className: "border-emerald-500/40 bg-emerald-50 text-emerald-700",
    description: "Full control over the workspace, including billing.",
  },
  [WORKSPACE_ROLE.property_manager]: {
    label: formatWorkspaceRoleLabel(WORKSPACE_ROLE.property_manager),
    className: "border-indigo-500/40 bg-indigo-50 text-indigo-700",
    description: "Day-to-day administrator for the workspace.",
  },
  [WORKSPACE_ROLE.maintenance_coordinator]: {
    label: formatWorkspaceRoleLabel(WORKSPACE_ROLE.maintenance_coordinator),
    className: "border-sky-500/40 bg-sky-50 text-sky-700",
    description: "Triages tickets and manages technician assignments.",
  },
  [WORKSPACE_ROLE.accountant]: {
    label: formatWorkspaceRoleLabel(WORKSPACE_ROLE.accountant),
    className: "border-amber-500/40 bg-amber-50 text-amber-700",
    description: "Financial reporting, invoicing, and payouts.",
  },
  [WORKSPACE_ROLE.member]: {
    label: formatWorkspaceRoleLabel(WORKSPACE_ROLE.member),
    className: "border-slate-500/40 bg-slate-50 text-slate-700",
    description: "Read-only access to workspace activity.",
  },
};

export const WORKSPACE_ROLE_INVITE_OPTIONS: ReadonlyArray<{
  value: AssignableWorkspaceRole;
  label: string;
  description: string;
}> = WORKSPACE_ASSIGNABLE_ROLE_VALUES.map((role) => ({
  value: role,
  label: WORKSPACE_ROLE_META[role].label,
  description: WORKSPACE_ROLE_META[role].description,
}));
