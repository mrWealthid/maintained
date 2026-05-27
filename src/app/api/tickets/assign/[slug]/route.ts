import { TICKET_STATUS } from "@/shared/enums/enums";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ensureTicketRoom } from "@/lib/chat/chat";
import { pusherServer } from "@/lib/pusher/pusher";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { TicketActivity } from "@/models/ticketActivity";
import Ticket, { ITicket } from "@/models/ticketModel";
import { resolveTicketIdentifier } from "@/lib/tickets/resolve-ticket-identifier";
import User from "@/models/userModel";
import { findWorkspaceMembershipByUser } from "@/lib/tenancy/workspace-membership-access";
import { Types, HydratedDocument } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { USER_TYPE } from "@/shared/auth/roles";

const assignTechnicianBodySchema = z.object({
  assignedTo: z.string().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const verify = await getUserFromCookies();

    if (!verify) throw ApiError.unauthorized();
    if (verify.isUserRole) throw ApiError.forbidden();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_ASSIGN);

    const { assignedTo } = parseOrThrow(
      assignTechnicianBodySchema,
      await request.json()
    );

    const adminUser = await User.findById(verify.id);
    if (!adminUser) throw ApiError.notFound("Admin user not found");

    const technician = await User.findById(assignedTo);
    if (!technician) throw ApiError.notFound("Technician not found");

    const membership = await findWorkspaceMembershipByUser({
      workspaceId: verify.currentBusiness,
      userId: assignedTo,
    });

    if (!membership || membership.role !== USER_TYPE.technician) {
      throw ApiError.badRequest("User is not a technician in this business");
    }

    const ticketId = await resolveTicketIdentifier(slug);

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
        actionedBy: adminUser.id,
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
      action: "assigned",
      description: `Ticket assigned to ${technician.name} by ${adminUser.name}`,
      changedBy: adminUser.id,
      metadata: {
        assignedTo: {
          previous: previous.assignedTo || null,
          current: assignedTo,
        },
        actionedBy: {
          previous: previous.actionedBy || null,
          current: adminUser.id,
        },
        status: {
          previous: previous.status,
          current: TICKET_STATUS.assigned,
        },
      },
    });

    // assertPopulated<typeof Ticket>(updatedRequest, "user");

    const sysText =
      previous.assignedTo?.id && previous.assignedTo.id !== updatedRequest?.assignedTo?.id
        ? `Technician changed from ${previous.assignedTo?.name ?? "previous"} to ${updatedRequest.assignedTo?.name} by ${updatedRequest.actionedBy?.name}.`
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
