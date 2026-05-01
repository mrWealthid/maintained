import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { TicketActivity } from "@/models/ticketActivity";
import Ticket from "@/models/ticketModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    const { ticketId } = await params;
    const verify = await getUserFromCookies();

    if (!verify || !verify.isTechnicianRole || !verify.isSuperAdminRole) {
      throw ApiError.unauthorized();
    }

    const { type } = await request.json();

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    const previous = await Ticket.findById(ticketId);
    if (!previous) throw ApiError.notFound("No ticket found with id");

    const updatedRequest = await Ticket.findByIdAndUpdate(
      ticketId,
      { actionedBy: verify.id, type },
      { new: true, runValidators: true, context: "query" },
    );

    await TicketActivity.create({
      ticket: ticketId,
      action: "type-changed",
      description: `Assigned to ${user.name}`,
      changedBy: user.id,
      metadata: {
        field: "type",
        previous: previous.type,
        current: updatedRequest?.type,
      },
    });

    return NextResponse.json({
      message: "Ticket Type Updated Successfully",
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
