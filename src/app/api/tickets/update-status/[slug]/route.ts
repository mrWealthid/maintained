import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { TicketActivity } from "@/models/ticketActivity";
import Ticket from "@/models/ticketModel";
import { resolveTicketIdentifier } from "@/lib/tickets/resolve-ticket-identifier";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

const updateStatusBodySchema = z.object({
  status: z.string().trim().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    if (verify.isUserRole) throw ApiError.forbidden();
    await assertLegacyWorkspacePermission(
      verify,
      PERMISSION.TICKETS_STATUS_MANAGE
    );

    const { status } = parseOrThrow(
      updateStatusBodySchema,
      await request.json()
    );

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    const ticketId = await resolveTicketIdentifier(slug);
    const previous = await Ticket.findById(ticketId);
    if (!previous) throw ApiError.notFound("No ticket found with id");

    const updatedRequest = await Ticket.findByIdAndUpdate(
      ticketId,
      { actionedBy: verify.id, status },
      { new: true, runValidators: true, context: "query" },
    );

    await TicketActivity.create({
      ticket: ticketId,
      action: "status-changed",
      description: `Actioned by ${user.name}`,
      changedBy: user.id,
      metadata: {
        field: "status",
        previous: previous.status,
        current: updatedRequest?.status,
      },
    });

    return NextResponse.json({
      message: "Ticket Updated Successfully",
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
