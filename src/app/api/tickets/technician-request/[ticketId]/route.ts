import { TICKET_STATUS } from "@/shared/enums/enums";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { TechnicianRequest } from "@/models/technicanRequest";
import { TicketActivity } from "@/models/ticketActivity";
import Ticket from "@/models/ticketModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    const { ticketId } = await params;
    const verify = await getUserFromCookies();

    if (!verify || verify.isUserRole || verify.isTechnicianRole) {
      throw ApiError.unauthorized();
    }

    const adminUser = await User.findById(verify.id);
    if (!adminUser) throw ApiError.notFound("Admin user not found");

    const body = await request.json();
    const { technicianIds } = body;

    if (!Array.isArray(technicianIds) || technicianIds.length === 0) {
      throw ApiError.badRequest("At least one technician ID must be provided");
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw ApiError.notFound("Ticket not found");

    if (
      verify.isAdminRole &&
      ticket.actionedBy?.toString() !== verify.id.toString()
    ) {
      throw ApiError.forbidden("You are not allowed to perform this action");
    }

    const existingRequests = await TechnicianRequest.find({ ticket: ticketId });
    const alreadyRequestedTechIds = existingRequests.map((r) =>
      r.technician.toString(),
    );

    const newTechIds = technicianIds.filter(
      (id) => !alreadyRequestedTechIds.includes(id),
    );

    const newRequests = await Promise.all(
      newTechIds.map((techId) =>
        TechnicianRequest.create({
          ticket: ticketId,
          technician: techId,
          sentBy: adminUser.id,
          expiresAt: body.expiresAt,
        }),
      ),
    );

    if (newRequests.length > 0) {
      ticket.status = TICKET_STATUS.pending_assignment;
      await ticket.save();
    }

    await TicketActivity.create({
      ticket: ticketId,
      action: "status-changed",
      description: `Request sent to technicians for assignment`,
      changedBy: adminUser.id,
      metadata: {
        field: "status",
        previous: ticket.status,
        current: ticket.status,
      },
    });

    return NextResponse.json({
      message: "Technician assignment requests sent successfully",
      success: true,
      count: newRequests.length,
      requests: newRequests,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
