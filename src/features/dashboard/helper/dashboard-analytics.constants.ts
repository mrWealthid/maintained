import { TECHNICIAN_RESPONSE, TICKET_PRIORITY, TICKET_STATUS } from "@/shared/enums/enums";

export const DASHBOARD_OPEN_TICKET_STATUSES = [
  TICKET_STATUS.pending,
  TICKET_STATUS.processing,
  TICKET_STATUS.pending_assignment,
  TICKET_STATUS.assigned,
  TICKET_STATUS.scheduled,
] as const;

export const DASHBOARD_TICKET_STATUS_ORDER = [
  TICKET_STATUS.pending,
  TICKET_STATUS.processing,
  TICKET_STATUS.pending_assignment,
  TICKET_STATUS.assigned,
  TICKET_STATUS.scheduled,
  TICKET_STATUS.completed,
  TICKET_STATUS.declined,
] as const;

export const DASHBOARD_PRIORITY_ORDER = [
  TICKET_PRIORITY.emergency,
  TICKET_PRIORITY.high,
  TICKET_PRIORITY.medium,
  TICKET_PRIORITY.low,
] as const;

export const DASHBOARD_TECHNICIAN_REQUEST_STATUS_ORDER = [
  TECHNICIAN_RESPONSE.pending,
  TECHNICIAN_RESPONSE.applied,
  TECHNICIAN_RESPONSE.selected,
  TECHNICIAN_RESPONSE.inspection_requested,
  TECHNICIAN_RESPONSE.declined,
] as const;

export const DASHBOARD_MONTH_WINDOW = 6;
