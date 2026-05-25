import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import Ticket from "@/models/ticketModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import {
  ticketAiTriageSchema,
  ticketAiTriageWorkflowSchema,
  ticketFormSchema,
} from "@/features/tickets/models/ticket-form.model";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { AI_TRIAGE_STATUS } from "@/shared/enums/enums";

const ticketUpdateBodySchema = ticketFormSchema
  .partial()
  .merge(ticketAiTriageWorkflowSchema)
  .extend({
    aiTriage: ticketAiTriageSchema.optional(),
  });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    const { ticketId } = await params;
    const verify = await getUserFromCookies(request);
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_VIEW);

    const ticket = await Ticket.findById(ticketId).populate([
      { path: "category", select: "name description" },
      { path: "type", select: "name description" },
      { path: "user", select: "name email photo contact" },
      { path: "assignedTo", select: "name email photo" },
      { path: "actionedBy", select: "name email photo" },
      { path: "property", select: "name type address code" },
      { path: "unit", select: "label floor bedrooms bathrooms sizeSqft" },
      {
        path: "relatedTo",
        select: "title status createdAt propertyName unitLabel priority",
      },
      {
        path: "requests",
        populate: { path: "technician", select: "name email photo" },
      },
    ]);

    if (!ticket) throw ApiError.notFound("Ticket not found");

    return NextResponse.json({
      status: "success",
      data: ticket.toJSON(),
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    const { ticketId } = await params;
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_EDIT);

    const rest = parseOrThrow(ticketUpdateBodySchema, await request.json());
    if (rest.relatedTo === ticketId) {
      throw ApiError.badRequest("A ticket cannot be related to itself");
    }

    if (rest.relatedTo) {
      if (!mongoose.Types.ObjectId.isValid(rest.relatedTo)) {
        throw ApiError.badRequest("Invalid related ticket");
      }

      const relatedTicket = await Ticket.findById(rest.relatedTo).select("_id");
      if (!relatedTicket) {
        throw ApiError.badRequest("Related ticket not found");
      }
    }

    const now = new Date();
    const update = {
      ...rest,
      aiTriageStartedAt:
        rest.aiTriageStartedAt ??
        (rest.aiTriageStatus === AI_TRIAGE_STATUS.processing ? now : undefined),
      aiTriageCompletedAt:
        rest.aiTriageCompletedAt ??
        (rest.aiTriageStatus === AI_TRIAGE_STATUS.completed ? now : undefined),
      aiTriageFailedAt:
        rest.aiTriageFailedAt ??
        (rest.aiTriageStatus === AI_TRIAGE_STATUS.failed ? now : undefined),
      ...(rest.aiTriage
        ? {
            aiTriage: {
              ...rest.aiTriage,
              analyzedAt: rest.aiTriage.analyzedAt ?? now,
            },
          }
        : {}),
    };
    const ticketFilter = verify.isUserRole
      ? {
          _id: ticketId,
          user: verify.id,
          business: new mongoose.Types.ObjectId(String(verify.currentBusiness)),
        }
      : {
          _id: ticketId,
          business: new mongoose.Types.ObjectId(String(verify.currentBusiness)),
        };

    const updatedRequest = await Ticket.findOneAndUpdate(
      ticketFilter,
      update,
      { new: true, runValidators: true },
    );

    if (!updatedRequest) {
      throw ApiError.forbidden(
        "You are not authorized to update this ticket or ticket not found",
      );
    }

    return NextResponse.json({
      message: "Ticket Updated Successfully",
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    const { ticketId } = await params;
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    if (!verify.isUserRole) throw ApiError.forbidden();

    const ticket = await Ticket.findOneAndDelete({
      _id: ticketId,
      user: verify.id,
    });

    if (!ticket) {
      throw ApiError.forbidden(
        "Ticket not found or you are not authorized to delete this ticket",
      );
    }

    return NextResponse.json({
      message: "Ticket deleted Successfully",
      success: true,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
