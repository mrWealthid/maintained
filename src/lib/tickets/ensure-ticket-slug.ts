import "server-only";

import mongoose from "mongoose";

import { ApiError } from "@/lib/errors/apiError";
import { buildTicketSlug, isSlugDuplicateKeyError } from "@/lib/tickets/ticket-slug";
import Ticket from "@/models/ticketModel";

type TicketSlugDocument = {
  _id?: unknown;
  id?: string | null;
  slug?: string | null;
  title?: string | null;
};

function toObjectId(id: unknown) {
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === "string" && mongoose.isValidObjectId(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

export async function ensureTicketSlug(ticket?: TicketSlugDocument | null) {
  if (!ticket || ticket.slug) return;

  const ticketId = toObjectId(ticket._id ?? ticket.id);
  if (!ticketId) return;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = buildTicketSlug(ticket.title ?? "ticket");

    try {
      const result = await Ticket.collection.updateOne(
        {
          _id: ticketId,
          $or: [
            { slug: { $exists: false } },
            { slug: null },
            { slug: "" },
          ],
        },
        { $set: { slug } },
      );

      if (result.matchedCount > 0) {
        ticket.slug = slug;
        return;
      }

      const existing = await Ticket.collection.findOne<{ slug?: string }>(
        { _id: ticketId },
        { projection: { slug: 1 } },
      );
      if (existing?.slug) ticket.slug = existing.slug;
      return;
    } catch (error) {
      if (isSlugDuplicateKeyError(error)) continue;
      throw error;
    }
  }

  throw ApiError.internal("Could not generate ticket slug");
}

export async function ensureTicketSlugs(
  tickets: readonly (TicketSlugDocument | null | undefined)[],
) {
  await Promise.all(tickets.map((ticket) => ensureTicketSlug(ticket)));
}
