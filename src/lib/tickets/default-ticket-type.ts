import TicketType from "@/models/ticketTypeModel";

export const DEFAULT_TICKET_TYPE_NAME = "Repair";

export const DEFAULT_TICKET_TYPES = [
  {
    key: "repair",
    name: DEFAULT_TICKET_TYPE_NAME,
    description: "Default repair request type used before automated analysis.",
  },
  {
    key: "inspection",
    name: "Inspection",
    description: "Requests that require an inspection or diagnosis first.",
  },
  {
    key: "installation",
    name: "Installation",
    description: "Install new fixtures, equipment, or property components.",
  },
  {
    key: "replacement",
    name: "Replacement",
    description: "Replace damaged, expired, or failed items.",
  },
  {
    key: "preventive-maintenance",
    name: "Preventive Maintenance",
    description: "Scheduled upkeep to reduce future repair issues.",
  },
  {
    key: "emergency",
    name: "Emergency",
    description: "Urgent requests that need immediate attention.",
  },
] as const;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function ensureDefaultTicketTypes() {
  for (const ticketType of DEFAULT_TICKET_TYPES) {
    await TicketType.findOneAndUpdate(
      {
        $or: [
          { key: ticketType.key, business: null },
          { key: ticketType.key, business: { $exists: false } },
          {
            name: new RegExp(`^${escapeRegExp(ticketType.name)}$`, "i"),
            business: null,
          },
          {
            name: new RegExp(`^${escapeRegExp(ticketType.name)}$`, "i"),
            business: { $exists: false },
          },
        ],
      },
      {
        $set: {
          key: ticketType.key,
          name: ticketType.name,
          description: ticketType.description,
          business: null,
          isDefault: true,
          isSystem: true,
          isActive: true,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
  }
}

export async function ensureDefaultRepairTicketType() {
  await ensureDefaultTicketTypes();

  return TicketType.findOne({
    key: "repair",
    business: null,
    isActive: true,
  });
}
