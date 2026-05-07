import { Ban, RefreshCw, Trash2 } from "lucide-react";
import type { ActionConfirmConfig } from "@/shared/model/action-confirm.model";
import type { TableFilterField } from "@/shared/components/table/models/table.model";
import {
  WORKSPACE_ROLE,
  WORKSPACE_ASSIGNABLE_ROLE_VALUES,
  USER_TYPE,
  formatWorkspaceRoleLabel,
  type AssignableWorkspaceRole,
} from "@/shared/auth/roles";
import {
  TEAM_INVITE_ROLE_VALUES,
  TEAM_MEMBER_STATUS,
  type TeamListBulkAction,
  type TeamInviteRole,
} from "../models/team.model";

export type WorkspaceRoleMeta = {
  label: string;
  className: string;
  description: string;
};

export const WORKSPACE_ROLE_META: Record<WORKSPACE_ROLE, WorkspaceRoleMeta> = {
  [WORKSPACE_ROLE.owner]: {
    label: formatWorkspaceRoleLabel(WORKSPACE_ROLE.owner),
    className: "border-status-resolved/40/40 bg-status-resolved text-status-resolved",
    description: "Full control over the workspace, including billing.",
  },
  [WORKSPACE_ROLE.property_manager]: {
    label: formatWorkspaceRoleLabel(WORKSPACE_ROLE.property_manager),
    className: "border-status-progress/40/40 bg-status-progress text-status-progress",
    description: "Day-to-day administrator for the workspace.",
  },
  [WORKSPACE_ROLE.maintenance_coordinator]: {
    label: formatWorkspaceRoleLabel(WORKSPACE_ROLE.maintenance_coordinator),
    className: "border-status-progress/40/40 bg-status-progress text-status-progress",
    description: "Triages tickets and manages technician assignments.",
  },
  [WORKSPACE_ROLE.accountant]: {
    label: formatWorkspaceRoleLabel(WORKSPACE_ROLE.accountant),
    className: "border-status-open/40/40 bg-status-open text-status-open",
    description: "Financial reporting, invoicing, and payouts.",
  },
  [WORKSPACE_ROLE.member]: {
    label: formatWorkspaceRoleLabel(WORKSPACE_ROLE.member),
    className: "border-slate-500/40 bg-slate-50 text-slate-700",
    description: "Read-only access to workspace activity.",
  },
};

export const WORKSPACE_ROLE_INVITE_OPTIONS: ReadonlyArray<{
  value: TeamInviteRole;
  label: string;
  description: string;
}> = TEAM_INVITE_ROLE_VALUES.map((role) => {
  if (role === USER_TYPE.tenant) {
    return {
      value: role,
      label: "Tenant",
      description:
        "Resident access to raise maintenance tickets and track repairs.",
    };
  }
  if (role === USER_TYPE.technician) {
    return {
      value: role,
      label: "Technician",
      description:
        "Service-provider access to assigned work, schedules, and quotes.",
    };
  }

  return {
    value: role,
    label: WORKSPACE_ROLE_META[role as AssignableWorkspaceRole].label,
    description:
      WORKSPACE_ROLE_META[role as AssignableWorkspaceRole].description,
  };
});

export const TEAM_LIST_STATUS_TABS: Array<{
  label: string;
  value: "all" | TEAM_MEMBER_STATUS;
}> = [
  { label: "All", value: "all" },
  { label: "Active", value: TEAM_MEMBER_STATUS.active },
  { label: "Pending", value: TEAM_MEMBER_STATUS.pending },
  { label: "Accepted", value: TEAM_MEMBER_STATUS.accepted },
  { label: "Declined", value: TEAM_MEMBER_STATUS.declined },
];

export const TEAM_LIST_CONFIRM_CONFIG: Record<
  TeamListBulkAction,
  ActionConfirmConfig
> = {
  resend: {
    title: "Resend team invites",
    describe: (count) =>
      `A fresh onboarding email will be sent to ${count} pending invite${count === 1 ? "" : "s"}.`,
    confirmLabel: "Resend invites",
    variant: "default",
    icon: RefreshCw,
  },
  deactivate: {
    title: "Deactivate selected members",
    describe: (count) =>
      `${count} team member${count === 1 ? "" : "s"} will lose workspace access.`,
    confirmLabel: "Deactivate members",
    variant: "destructive",
    icon: Ban,
  },
  delete: {
    title: "Delete selected records",
    describe: (count) =>
      `${count} selected team record${count === 1 ? "" : "s"} will be permanently removed.`,
    confirmLabel: "Delete selected",
    variant: "destructive",
    icon: Trash2,
  },
};

export const TEAM_LIST_FILTER_FIELDS: TableFilterField[] = [
  {
    key: "name",
    label: "Member name",
    searchType: "TEXT",
    placeholder: "Search member name",
  },
  {
    key: "role",
    label: "Role",
    searchType: "DROPDOWN",
    selectOptions: WORKSPACE_ROLE_INVITE_OPTIONS.map((role) => ({
      name: role.label,
      value: role.value,
    })),
  },
];
