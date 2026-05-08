import {
  INVITE_STATUS,
  type InviteStatus,
} from "../models/invite-status.model";

export type InviteStatusMeta = {
  label: string;
  className: string;
};

export const INVITE_STATUS_META: Record<InviteStatus, InviteStatusMeta> = {
  [INVITE_STATUS.INVITED]: {
    label: "Invited",
    className: "border-status-open/40/40 bg-status-open text-status-open",
  },
  [INVITE_STATUS.ACTIVATED]: {
    label: "Active",
    className: "border-status-resolved/40/40 bg-status-resolved text-status-resolved",
  },
  [INVITE_STATUS.DEACTIVATED]: {
    label: "Deactivated",
    className: "border-slate-500/40 bg-slate-50 text-slate-700",
  },
  [INVITE_STATUS.DECLINED]: {
    label: "Declined",
    className: "border-destructive/40/40 bg-destructive text-destructive",
  },
};

export const INVITE_STATUS_FILTER_OPTIONS = (
  Object.keys(INVITE_STATUS_META) as InviteStatus[]
).map((value) => ({
  value,
  label: INVITE_STATUS_META[value].label,
}));

export const TENANT_LIST_FILTER_FIELDS = [
  {
    key: "name",
    label: "Tenant",
    searchType: "TEXT" as const,
    placeholder: "Search tenant name",
  },
  {
    key: "email",
    label: "Email",
    searchType: "TEXT" as const,
    placeholder: "Search tenant email",
  },
  {
    key: "property",
    label: "Property",
    searchType: "TEXT" as const,
    placeholder: "Search property name",
  },
  {
    key: "unit",
    label: "Unit",
    searchType: "TEXT" as const,
    placeholder: "Search unit label",
  },
  {
    key: "status",
    label: "Status",
    searchType: "DROPDOWN" as const,
    selectOptions: [
      { name: "Active", value: "active" },
      { name: "Pending", value: "pending" },
    ],
  },
];
