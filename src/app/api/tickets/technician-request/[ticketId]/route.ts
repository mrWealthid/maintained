import { TICKET_STATUS } from "@/shared/enums/enums";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { technicianRequestCreateSchema } from "@/features/technician-requests/models/technician-request.model";
import { TechnicianRequest } from "@/models/technicanRequest";
import { TicketActivity } from "@/models/ticketActivity";
import Ticket from "@/models/ticketModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

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
    await assertLegacyWorkspacePermission(
      verify,
      PERMISSION.TECHNICIAN_REQUESTS_CREATE
    );

    const adminUser = await User.findById(verify.id);
    if (!adminUser) throw ApiError.notFound("Admin user not found");

    const body = parseOrThrow(
      technicianRequestCreateSchema,
      await request.json()
    );
    const { technicianIds } = body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw ApiError.notFound("Ticket not found");

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

    const previousStatus = ticket.status;
    const previousActionedBy = ticket.actionedBy;

    if (newRequests.length > 0) {
      ticket.actionedBy = adminUser.id;
      ticket.status = TICKET_STATUS.pending_assignment;
      await ticket.save();
    }

    await TicketActivity.create({
      ticket: ticketId,
      action: "status-changed",
      description: `Technician assignment request sent by ${adminUser.name}`,
      changedBy: adminUser.id,
      metadata: {
        status: {
          previous: previousStatus,
          current: ticket.status,
        },
        actionedBy: {
          previous: previousActionedBy,
          current: ticket.actionedBy,
        },
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
