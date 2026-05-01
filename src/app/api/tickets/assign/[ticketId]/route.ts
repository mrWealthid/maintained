import { ROLES, TICKET_STATUS } from "@/shared/enums/enums";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ensureTicketRoom } from "@/lib/chat/chat";
import { pusherServer } from "@/lib/pusher/pusher";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { TicketActivity } from "@/models/ticketActivity";
import Ticket, { ITicket } from "@/models/ticketModel";
import User from "@/models/userModel";
import mongoose, { Types, HydratedDocument } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

const assignTechnicianBodySchema = z.object({
  assignedTo: z.string().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const verify = await getUserFromCookies();

    if (!verify || verify.isUserRole) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_ASSIGN);

    const { assignedTo } = parseOrThrow(
      assignTechnicianBodySchema,
      await request.json()
    );

    const adminUser = await User.findById(verify.id);
    if (!adminUser) throw ApiError.notFound("Admin user not found");

    const businessId = new mongoose.Types.ObjectId(verify.currentBusiness);

    const technician = await User.findById(assignedTo);
    if (!technician) throw ApiError.notFound("Technician not found");

    const membership = technician.memberships.find(
      (m) => m.business.equals(businessId) && m.role === ROLES.technician
    );

    if (!membership) {
      throw ApiError.badRequest("User is not a technician in this business");
    }

    const previous = (await Ticket.findById(ticketId)
      .populate<{ user: { name: string; id: string } }>("user", "id name")
      .populate<{
        assignedTo?: { name: string; id: string };
      }>("assignedTo", "id name")
      .populate<{
        actionedBy?: { name: string; id: string };
      }>("actionedBy", "id name")) as HydratedDocument<ITicket> & {
      user: { name: string; id: string };
      assignedTo?: { name: string; id: string };
      actionedBy?: { name: string; id: string };
    };

    if (!previous) throw ApiError.notFound("No ticket found with id");

    // send assignment technician request
    const updatedRequest = (await Ticket.findByIdAndUpdate(
      ticketId,
      {
        // actionedBy: adminUser.id,
        assignedTo,
        status: TICKET_STATUS.assigned,
      },
      { new: true, runValidators: true, context: "query" }
    )
      .populate<{ user: { name: string; id: string } }>("user", "id name")
      .populate<{ assignedTo?: { name: string; id: string } }>(
        "assignedTo",
        "id name"
      )
      .populate<{ actionedBy?: { name: string; id: string } }>(
        "actionedBy",
        "id name"
      )) as HydratedDocument<ITicket> & {
      user: { name: string; id: string };
      assignedTo?: { name: string; id: string };
      actionedBy?: { name: string; id: string };
    };
    await TicketActivity.create({
      ticket: ticketId,
      action: "status-changed",
      description: `Ticket assigned to ${technician.name}`,
      changedBy: adminUser.id,
      metadata: {
        field: "assignedTo",
        previous: previous.assignedTo || null,
        current: assignedTo,
      },
    });

    // assertPopulated<typeof Ticket>(updatedRequest, "user");

    const sysText =
      previous.assignedTo && previous.assignedTo !== updatedRequest?.assignedTo
        ? `Technician changed from ${previous.assignedTo?.name ?? "previous"} to new technician by ${updatedRequest.assignedTo?.name}.`
        : `Technician ${updatedRequest.assignedTo?.name} assigned by ${updatedRequest.actionedBy?.name}.`;

    const { room, msg } = await ensureTicketRoom({
      ticketId: updatedRequest.id,
      requesterId: new Types.ObjectId(updatedRequest.user?.id),
      technicianId: new Types.ObjectId(updatedRequest.assignedTo?.id),
      adminId: new Types.ObjectId(updatedRequest.actionedBy?.id),
      sysText,
    });

    try {
      await pusherServer.trigger(`room-${room._id}`, "message:new", {
        _id: msg._id,
        type: msg.type,
        text: msg.text,
        createdAt: msg.createdAt,
      });
    } catch (e) {
      // log and move on
    }

    return NextResponse.json({
      message: "Technician assigned successfully",
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
