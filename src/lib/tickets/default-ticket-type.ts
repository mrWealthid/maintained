import TicketType from "@/models/ticketTypeModel";
import {
  DEFAULT_TICKET_TYPES,
  normalizeTicketType,
} from "@/shared/tickets/ticket-types";

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

export async function resolveTicketTypeByRecommendation(args: {
  recommendedTicketType?: string | null;
}) {
  const recommendedTicketType = args.recommendedTicketType?.trim();
  if (!recommendedTicketType) return null;

  return normalizeTicketType(recommendedTicketType);
}
