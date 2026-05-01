import { TICKET_PRIORITY, type TicketPriority } from "../models/ticket-priority.model";
import { TICKET_STATUS, type TicketStatus } from "../models/ticket-status.model";

/**
 * Static badge / label metadata for ticket lists. Lives in feature
 * `data/` per ENGINEERING_PATTERNS so the same map drives badge,
 * filter, and detail views without separate ternaries for label vs
 * className.
 */

export type TicketStatusMeta = {
  label: string;
  className: string;
  description: string;
};

export const TICKET_STATUS_META: Record<TicketStatus, TicketStatusMeta> = {
  [TICKET_STATUS.PENDING]: {
    label: "Pending",
    className: "border-amber-500/40 bg-amber-50 text-amber-700",
    description: "Submitted and awaiting triage.",
  },
  [TICKET_STATUS.PROCESSING]: {
    label: "Processing",
    className: "border-sky-500/40 bg-sky-50 text-sky-700",
    description: "Being worked on by a manager.",
  },
  [TICKET_STATUS.PENDING_ASSIGNMENT]: {
    label: "Pending Assignment",
    className: "border-indigo-500/40 bg-indigo-50 text-indigo-700",
    description: "Sent to technicians; waiting for one to accept.",
  },
  [TICKET_STATUS.ASSIGNED]: {
    label: "Assigned",
    className: "border-violet-500/40 bg-violet-50 text-violet-700",
    description: "Technician selected.",
  },
  [TICKET_STATUS.SCHEDULED]: {
    label: "Scheduled",
    className: "border-blue-500/40 bg-blue-50 text-blue-700",
    description: "Visit booked with the resident.",
  },
  [TICKET_STATUS.COMPLETED]: {
    label: "Completed",
    className: "border-emerald-500/40 bg-emerald-50 text-emerald-700",
    description: "Work finished and signed off.",
  },
  [TICKET_STATUS.DECLINED]: {
    label: "Declined",
    className: "border-rose-500/40 bg-rose-50 text-rose-700",
    description: "Closed without action.",
  },
};

export type TicketPriorityMeta = {
  label: string;
  className: string;
};

export const TICKET_PRIORITY_META: Record<TicketPriority, TicketPriorityMeta> =
  {
    [TICKET_PRIORITY.LOW]: {
      label: "Low",
      className: "border-slate-400/40 bg-slate-50 text-slate-700",
    },
    [TICKET_PRIORITY.MEDIUM]: {
      label: "Medium",
      className: "border-amber-400/40 bg-amber-50 text-amber-700",
    },
    [TICKET_PRIORITY.HIGH]: {
      label: "High",
      className: "border-rose-500/40 bg-rose-50 text-rose-700",
    },
  };

export const TICKET_STATUS_FILTER_OPTIONS = (
  Object.keys(TICKET_STATUS_META) as TicketStatus[]
).map((value) => ({
  value,
  label: TICKET_STATUS_META[value].label,
}));

export const TICKET_PRIORITY_FILTER_OPTIONS = (
  Object.keys(TICKET_PRIORITY_META) as TicketPriority[]
).map((value) => ({
  value,
  label: TICKET_PRIORITY_META[value].label,
}));
