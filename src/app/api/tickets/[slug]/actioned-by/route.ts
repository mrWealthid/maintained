import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { TICKET_STATUS } from "@/shared/enums/enums";
import Ticket from "@/models/ticketModel";
import { resolveTicketIdentifier } from "@/lib/tickets/resolve-ticket-identifier";
import { z } from "zod";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

const actionedByBodySchema = z.object({
  actionedBy: z.string().min(1),
  status: z.string().min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const user = await getUserFromCookies(request);
    if (!user) {
      throw ApiError.unauthorized();
    }
    await assertLegacyWorkspacePermission(user, PERMISSION.TICKETS_ASSIGN);

    const { actionedBy, status } = parseOrThrow(
      actionedByBodySchema,
      await request.json()
    );

    if (!mongoose.Types.ObjectId.isValid(actionedBy)) {
      throw ApiError.badRequest("Invalid actionedBy ID");
    }

    const ticketId = await resolveTicketIdentifier(slug);
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw ApiError.notFound("Ticket not found");

    const isPending = ticket.status === TICKET_STATUS.pending;
    const isSameActionedBy = ticket.actionedBy?.toString() === user.id;

    if (!isPending && !(isSameActionedBy || user.isSuperAdminRole)) {
      throw ApiError.forbidden("You are not allowed to update this ticket");
    }

    const update: { actionedBy: string; status?: string } = { actionedBy };
    if (status) update.status = status;

    await Ticket.findByIdAndUpdate(ticketId, update);

    return NextResponse.json(
      { message: "Ticket actionedBy updated successfully", ticket },
      { status: 200 },
    );
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
