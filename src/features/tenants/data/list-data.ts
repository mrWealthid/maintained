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
    className: "border-amber-500/40 bg-amber-50 text-amber-700",
  },
  [INVITE_STATUS.ACTIVATED]: {
    label: "Active",
    className: "border-emerald-500/40 bg-emerald-50 text-emerald-700",
  },
  [INVITE_STATUS.DEACTIVATED]: {
    label: "Deactivated",
    className: "border-slate-500/40 bg-slate-50 text-slate-700",
  },
  [INVITE_STATUS.DECLINED]: {
    label: "Declined",
    className: "border-rose-500/40 bg-rose-50 text-rose-700",
  },
};

export const INVITE_STATUS_FILTER_OPTIONS = (
  Object.keys(INVITE_STATUS_META) as InviteStatus[]
).map((value) => ({
  value,
  label: INVITE_STATUS_META[value].label,
}));
