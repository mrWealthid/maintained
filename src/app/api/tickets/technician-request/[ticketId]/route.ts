import { TICKET_STATUS } from "@/shared/enums/enums";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import MiddlewareFeatures from "@/middlewareFeatures";
import { TechnicianRequest } from "@/models/technicanRequest";
import { TicketActivity } from "@/models/ticketActivity";
import Ticket from "@/models/ticketModel";
import User from "@/models/userModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const verify = await getUserFromCookies();

    if (!verify || verify.isUserRole || verify.isTechnicianRole) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const adminUser = await User.findById(verify.id);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { technicianIds } = body;

    if (!Array.isArray(technicianIds) || technicianIds.length === 0) {
      return NextResponse.json(
        { error: "At least one technician ID must be provided" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 400 });
    }

    if (
      verify.isAdminRole &&
      ticket.actionedBy?.toString() !== verify.id.toString()
    ) {
      return NextResponse.json(
        { error: "You are not allowed to perform this action" },
        { status: 403 }
      );
    }

    const existingRequests = await TechnicianRequest.find({
      ticket: ticketId,
    });
    const alreadyRequestedTechIds = existingRequests.map((r) =>
      r.technician.toString()
    );

    // Filter out duplicates
    const newTechIds = technicianIds.filter(
      (id) => !alreadyRequestedTechIds.includes(id)
    );

    const newRequests = await Promise.all(
      newTechIds.map((techId) =>
        TechnicianRequest.create({
          ticket: ticketId,
          technician: techId,
          sentBy: adminUser.id,
          expiresAt: body.expiresAt,
        })
      )
    );

    //update ticket status to pending assignment
    if (newRequests.length > 0) {
      ticket.status = TICKET_STATUS.pending_assignment;
      await ticket.save();
    }

    // // Optionally log each new activity
    // await Promise.all(
    // 	newRequests.map((req) =>
    // 		TicketActivity.create({
    // 			ticket: ticketId,
    // 			action: 'assignment-request-sent',
    // 			changedBy: adminUser.id,
    // 			description: `Assignment request sent to technician with ID ${req.technician}`,
    // 			metadata: {
    // 				technicianId: req.technician
    // 			}
    // 		})
    // 	)
    // );

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
