import { TICKET_TYPE } from "@/shared/enums/enums";

export const DEFAULT_TICKET_TYPE_NAME = "Repair";

export const TICKET_TYPE_VALUES = [
  TICKET_TYPE.repair,
  TICKET_TYPE.inspection,
  TICKET_TYPE.installation,
  TICKET_TYPE.replacement,
  TICKET_TYPE.preventive_maintenance,
  TICKET_TYPE.emergency,
] as const;

export const DEFAULT_TICKET_TYPES = [
  {
    key: TICKET_TYPE.repair,
    name: DEFAULT_TICKET_TYPE_NAME,
    description: "Default repair request type used before automated analysis.",
  },
  {
    key: TICKET_TYPE.inspection,
    name: "Inspection",
    description: "Requests that require an inspection or diagnosis first.",
  },
  {
    key: TICKET_TYPE.installation,
    name: "Installation",
    description: "Install new fixtures, equipment, or property components.",
  },
  {
    key: TICKET_TYPE.replacement,
    name: "Replacement",
    description: "Replace damaged, expired, or failed items.",
  },
  {
    key: TICKET_TYPE.preventive_maintenance,
    name: "Preventive Maintenance",
    description: "Scheduled upkeep to reduce future repair issues.",
  },
  {
    key: TICKET_TYPE.emergency,
    name: "Emergency",
    description: "Urgent requests that need immediate attention.",
  },
] as const;

export function normalizeTicketTypeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isTicketType(value: unknown): value is TICKET_TYPE {
  return (
    typeof value === "string" &&
    (TICKET_TYPE_VALUES as readonly string[]).includes(value)
  );
}

export function normalizeTicketType(value: string): TICKET_TYPE | null {
  const normalized = normalizeTicketTypeKey(value);
  const match = DEFAULT_TICKET_TYPES.find(
    (ticketType) =>
      ticketType.key === value ||
      ticketType.key === normalized ||
      normalizeTicketTypeKey(ticketType.name) === normalized,
  );

  return match?.key ?? null;
}

export function getTicketTypeLabel(value?: string | null) {
  if (!value) return undefined;

  const match = DEFAULT_TICKET_TYPES.find((ticketType) => ticketType.key === value);
  return match?.name ?? value;
}

export function getTicketTypePromptOptions() {
  return DEFAULT_TICKET_TYPES.map(({ key, name, description }) => ({
    value: key,
    label: name,
    description,
  }));
}
