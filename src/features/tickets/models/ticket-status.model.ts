/**
 * Canonical ticket status constants. Mirrors the legacy `TICKET_STATUS`
 * enum in `src/shared/enums/enums.ts` but follows the eventSphere
 * pattern of object-map + value array + type guard so consumers can
 * branch with `STATUS.X` and discriminate without nested ternaries.
 */

export const TICKET_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  PENDING_ASSIGNMENT: "PENDING_ASSIGNMENT",
  ASSIGNED: "ASSIGNED",
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  DECLINED: "DECLINED",
} as const;

export const TICKET_STATUS_VALUES = Object.values(TICKET_STATUS);

export type TicketStatus = (typeof TICKET_STATUS_VALUES)[number];

export function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === "string" &&
    TICKET_STATUS_VALUES.includes(value as TicketStatus)
  );
}

export const TICKET_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TICKET_STATUS.PENDING]: [TICKET_STATUS.PROCESSING, TICKET_STATUS.DECLINED],
  [TICKET_STATUS.PROCESSING]: [
    TICKET_STATUS.PENDING_ASSIGNMENT,
    TICKET_STATUS.PENDING,
    TICKET_STATUS.DECLINED,
  ],
  [TICKET_STATUS.PENDING_ASSIGNMENT]: [
    TICKET_STATUS.ASSIGNED,
    TICKET_STATUS.PROCESSING,
    TICKET_STATUS.DECLINED,
  ],
  [TICKET_STATUS.ASSIGNED]: [TICKET_STATUS.SCHEDULED, TICKET_STATUS.DECLINED],
  [TICKET_STATUS.SCHEDULED]: [TICKET_STATUS.COMPLETED, TICKET_STATUS.DECLINED],
  [TICKET_STATUS.COMPLETED]: [],
  [TICKET_STATUS.DECLINED]: [],
};

export function canTransitionTicketStatus(
  from: TicketStatus,
  to: TicketStatus,
): boolean {
  return TICKET_STATUS_TRANSITIONS[from].includes(to);
}
