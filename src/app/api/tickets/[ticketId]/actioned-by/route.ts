import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { TICKET_STATUS } from "@/shared/enums/enums";
import Ticket from "@/models/ticketModel";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    const { ticketId } = await params;

    const user = await getUserFromCookies(request);
    if (!user || (!user.isAdminRole && !user.isSuperAdminRole)) {
      throw ApiError.unauthorized();
    }

    const { actionedBy, status } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(actionedBy)) {
      throw ApiError.badRequest("Invalid actionedBy ID");
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw ApiError.notFound("Ticket not found");

    const isPending = ticket.status === TICKET_STATUS.pending;
    const isSameActionedBy = ticket.actionedBy?.toString() === user.id;

    if (!isPending && !(isSameActionedBy || user.isSuperAdminRole)) {
      throw ApiError.forbidden("You are not allowed to update this ticket");
    }

    await Ticket.findByIdAndUpdate(ticketId, { actionedBy, status });

    return NextResponse.json(
      { message: "Ticket actionedBy updated successfully", ticket },
      { status: 200 },
    );
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
