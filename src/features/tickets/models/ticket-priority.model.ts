import { TICKET_PRIORITY } from "@/shared/enums/enums";

export { TICKET_PRIORITY };

export const TICKET_PRIORITY_VALUES = Object.values(TICKET_PRIORITY) as TICKET_PRIORITY[];

export type TicketPriority = TICKET_PRIORITY;

export function isTicketPriority(value: unknown): value is TicketPriority {
  return (
    typeof value === "string" &&
    TICKET_PRIORITY_VALUES.includes(value as TICKET_PRIORITY)
  );
}
