export const TICKET_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export const TICKET_PRIORITY_VALUES = Object.values(TICKET_PRIORITY);

export type TicketPriority = (typeof TICKET_PRIORITY_VALUES)[number];

export function isTicketPriority(value: unknown): value is TicketPriority {
  return (
    typeof value === "string" &&
    TICKET_PRIORITY_VALUES.includes(value as TicketPriority)
  );
}
