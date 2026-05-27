import "server-only";
import mongoose, { Types } from "mongoose";

import Ticket from "@/models/ticketModel";
import { connect } from "@/dbConfig/dbConfig";
import { ApiError } from "@/lib/errors/apiError";

export async function resolveTicketIdentifier(
  idOrSlug: string,
): Promise<Types.ObjectId> {
  if (!idOrSlug) throw ApiError.badRequest("Missing ticket identifier");

  if (mongoose.isValidObjectId(idOrSlug)) {
    return new Types.ObjectId(idOrSlug);
  }

  await connect();

  const ticket = await Ticket.findOne({ slug: idOrSlug }, { _id: 1 }).lean<{
    _id: Types.ObjectId;
  } | null>();

  if (!ticket) throw ApiError.notFound("Ticket not found");
  return ticket._id;
}
