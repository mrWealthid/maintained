import { TICKET_PRIORITY, type TicketPriority } from "../models/ticket-priority.model";
import { TICKET_STATUS, type TicketStatus } from "../models/ticket-status.model";
import type { TableFilterField } from "@/shared/components/table/models/table.model";

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
    className: "bg-status-open text-status-open-foreground",
    description: "Submitted and awaiting triage.",
  },
  [TICKET_STATUS.PROCESSING]: {
    label: "Processing",
    className: "bg-status-progress text-status-progress-foreground",
    description: "Being worked on by a manager.",
  },
  [TICKET_STATUS.PENDING_ASSIGNMENT]: {
    label: "Pending Assignment",
    className: "bg-status-open text-status-open-foreground",
    description: "Sent to technicians; waiting for one to accept.",
  },
  [TICKET_STATUS.ASSIGNED]: {
    label: "Assigned",
    className: "bg-status-progress text-status-progress-foreground",
    description: "Technician selected.",
  },
  [TICKET_STATUS.SCHEDULED]: {
    label: "Scheduled",
    className: "bg-primary text-primary-foreground",
    description: "Visit booked with the resident.",
  },
  [TICKET_STATUS.COMPLETED]: {
    label: "Completed",
    className: "bg-status-resolved text-status-resolved-foreground",
    description: "Work finished and signed off.",
  },
  [TICKET_STATUS.DECLINED]: {
    label: "Declined",
    className: "bg-status-overdue text-status-overdue-foreground",
    description: "Closed without action.",
  },
};

export type TicketPriorityMeta = {
  label: string;
  className: string;
};

export const TICKET_PRIORITY_META: Record<TicketPriority, TicketPriorityMeta> =
  {
    [TICKET_PRIORITY.low]: {
      label: "Low",
      className: "bg-muted text-muted-foreground",
    },
    [TICKET_PRIORITY.medium]: {
      label: "Medium",
      className: "bg-status-open text-status-open-foreground",
    },
    [TICKET_PRIORITY.high]: {
      label: "High",
      className: "bg-status-overdue text-status-overdue-foreground",
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

export const TICKET_LIST_FILTER_FIELDS: TableFilterField[] = [
  {
    key: "title",
    label: "Title",
    searchType: "TEXT",
    placeholder: "Search by title",
  },
  {
    key: "user",
    label: "User",
    searchType: "TEXT",
    placeholder: "User name",
  },
  {
    key: "area",
    label: "Area",
    searchType: "TEXT",
    placeholder: "Area",
  },
  {
    key: "status",
    label: "Status",
    searchType: "DROPDOWN",
    selectOptions: (Object.keys(TICKET_STATUS_META) as TicketStatus[]).map(
      (value) => ({
        name: TICKET_STATUS_META[value].label,
        value,
      }),
    ),
  },
  {
    key: "priority",
    label: "Priority",
    searchType: "DROPDOWN",
    selectOptions: (Object.keys(TICKET_PRIORITY_META) as TicketPriority[]).map(
      (value) => ({
        name: TICKET_PRIORITY_META[value].label,
        value,
      }),
    ),
  },
];
