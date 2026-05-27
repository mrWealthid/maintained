import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import Ticket, { ITicket } from "@/models/ticketModel";
import { resolveTicketIdentifier } from "@/lib/tickets/resolve-ticket-identifier";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ticketAiTriageSchema,
  ticketAiTriageWorkflowSchema,
  ticketFormSchema,
} from "@/features/tickets/models/ticket-form.model";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { AI_TRIAGE_STATUS, TICKET_STATUS } from "@/shared/enums/enums";
import {
  hasReTriageAttemptsLeft,
  isTriageInFlight,
  runReTriage,
} from "@/lib/tickets/retriage";

const ticketUpdateBodySchema = ticketFormSchema
  .partial()
  .merge(ticketAiTriageWorkflowSchema)
  .extend({
    aiTriage: ticketAiTriageSchema.optional(),
  });

const tenantTicketUpdateBodySchema = ticketFormSchema
  .omit({
    priority: true,
    property: true,
    unit: true,
  })
  .partial();

type TicketUpdateBody = z.infer<typeof ticketUpdateBodySchema>;

// Re-run AI triage only when the prior triage asked for more (human review or
// missing information) AND the tenant actually changed the description that the
// agent reads. Capped to avoid an edit war spinning the agent indefinitely.
async function maybeReTriage({
  existing,
  rest,
  ticket,
}: {
  existing: mongoose.HydratedDocument<ITicket>;
  rest: { description?: string; aiTriage?: unknown; aiTriageStatus?: unknown };
  ticket: mongoose.HydratedDocument<ITicket>;
}) {
  const priorTriage = existing.aiTriage;
  const wasFlagged =
    priorTriage?.needsHumanReview === true ||
    (priorTriage?.missingInformation?.length ?? 0) > 0;
  const descriptionChanged =
    typeof rest.description === "string" &&
    rest.description.trim() !== (existing.description ?? "").trim();
  const adminEditedTriage = Boolean(rest.aiTriage) || Boolean(rest.aiTriageStatus);

  if (
    !wasFlagged ||
    !descriptionChanged ||
    isTriageInFlight(existing.aiTriageStatus) ||
    !hasReTriageAttemptsLeft(existing.aiTriageRetryCount) ||
    adminEditedTriage
  ) {
    return;
  }

  await runReTriage(ticket);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const verify = await getUserFromCookies(request);
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_VIEW);

    const ticketId = await resolveTicketIdentifier(slug);

    const ticket = await Ticket.findById(ticketId).populate([
      { path: "category", select: "name description" },
      { path: "user", select: "name email photo contact" },
      { path: "assignedTo", select: "name email photo" },
      { path: "actionedBy", select: "name email photo" },
      { path: "property", select: "name type address code" },
      { path: "unit", select: "label floor bedrooms bathrooms sizeSqft" },
      {
        path: "relatedTo",
        select: "slug title status createdAt propertyName unitLabel priority",
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
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();

    const ticketId = await resolveTicketIdentifier(slug);

    const rest = parseOrThrow(
      verify.isUserRole ? tenantTicketUpdateBodySchema : ticketUpdateBodySchema,
      await request.json(),
    );
    if (rest.relatedTo === ticketId.toString()) {
      throw ApiError.badRequest("A ticket cannot be related to itself");
    }

    if (rest.relatedTo) {
      if (!mongoose.Types.ObjectId.isValid(rest.relatedTo)) {
        throw ApiError.badRequest("Invalid related ticket");
      }

      const relatedTicket = await Ticket.findOne({
        _id: rest.relatedTo,
        business: new mongoose.Types.ObjectId(String(verify.currentBusiness)),
      }).select("_id");
      if (!relatedTicket) {
        throw ApiError.badRequest("Related ticket not found");
      }
    }

    const now = new Date();
    const workflow = rest as Partial<TicketUpdateBody>;
    const update = {
      ...rest,
      aiTriageStartedAt:
        workflow.aiTriageStartedAt ??
        (workflow.aiTriageStatus === AI_TRIAGE_STATUS.processing
          ? now
          : undefined),
      aiTriageCompletedAt:
        workflow.aiTriageCompletedAt ??
        (workflow.aiTriageStatus === AI_TRIAGE_STATUS.completed
          ? now
          : undefined),
      aiTriageFailedAt:
        workflow.aiTriageFailedAt ??
        (workflow.aiTriageStatus === AI_TRIAGE_STATUS.failed
          ? now
          : undefined),
      ...(workflow.aiTriage
        ? {
            aiTriage: {
              ...workflow.aiTriage,
              analyzedAt: workflow.aiTriage.analyzedAt ?? now,
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

    const existing = await Ticket.findOne(ticketFilter).select(
      "description status aiTriage aiTriageStatus aiTriageRetryCount",
    );
    if (!existing) {
      throw ApiError.forbidden(
        "You are not authorized to update this ticket or ticket not found",
      );
    }

    if (verify.isUserRole) {
      if (existing.status !== TICKET_STATUS.processing) {
        throw ApiError.forbidden(
          "Tenant tickets can only be edited while they are processing",
        );
      }
    } else {
      await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_EDIT);
    }

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

    await maybeReTriage({ existing, rest, ticket: updatedRequest });

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
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    if (!verify.isUserRole) throw ApiError.forbidden();

    const ticketId = await resolveTicketIdentifier(slug);

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
