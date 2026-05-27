import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import { resolveTicketIdentifier } from "@/lib/tickets/resolve-ticket-identifier";
import {
  ticketAiTriageSchema,
  ticketAiTriageWorkflowSchema,
} from "@/features/tickets/models/ticket-form.model";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { sendAdminTriageCompleteEmail } from "@/lib/email/senders/tickets/sendAdminTriageCompleteEmail";
import { sendTenantTriageCompleteEmail } from "@/lib/email/senders/tickets/sendTenantTriageCompleteEmail";
import { resolveTicketTypeByRecommendation } from "@/lib/tickets/default-ticket-type";
import Ticket from "@/models/ticketModel";
import { AI_TRIAGE_STATUS, TICKET_PRIORITY, TICKET_STATUS } from "@/shared/enums/enums";

const ticketPriorityValues = Object.values(TICKET_PRIORITY) as [
  TICKET_PRIORITY,
  ...TICKET_PRIORITY[],
];

const internalAiTriageBodySchema = ticketAiTriageWorkflowSchema
  .extend({
    priority: z.enum(ticketPriorityValues).optional(),
    aiTriage: ticketAiTriageSchema.optional(),
  })
  .refine(
    (body) =>
      body.aiTriageStatus !== AI_TRIAGE_STATUS.failed ||
      Boolean(body.aiTriageError?.trim()),
    {
      message: "aiTriageError is required when aiTriageStatus is FAILED",
      path: ["aiTriageError"],
    },
  );

function assertInternalWebhookAuth(request: NextRequest) {
  const secret =
    process.env.N8N_WEBHOOK_SECRET ?? process.env.INTERNAL_API_SECRET;
  if (!secret) {
    throw ApiError.unavailable("Internal webhook secret is not configured");
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${secret}`) {
    throw ApiError.unauthorized("Invalid internal webhook token");
  }
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await connect();
    assertInternalWebhookAuth(request);

    const { slug } = await params;
    const ticketId = await resolveTicketIdentifier(slug);

    const body = parseOrThrow(
      internalAiTriageBodySchema,
      await request.json(),
    );
    const now = new Date();
    const aiTriageStatus = body.aiTriageStatus;
    const recommendedTicketType = body.aiTriage?.recommendedTicketType;
    const mappedTicketType = recommendedTicketType
      ? await resolveTicketTypeByRecommendation({ recommendedTicketType })
      : null;

    const currentTicket = await Ticket.findById(ticketId).select("status");
    if (!currentTicket) throw ApiError.notFound("Ticket not found");

    const shouldAdvanceStatus =
      aiTriageStatus === AI_TRIAGE_STATUS.completed &&
      currentTicket.status === TICKET_STATUS.pending;

    const lifecyclePatch = {
      aiTriageStatus,
      aiTriageStartedAt:
        body.aiTriageStartedAt ??
        (aiTriageStatus === AI_TRIAGE_STATUS.processing ? now : undefined),
      aiTriageCompletedAt:
        body.aiTriageCompletedAt ??
        (aiTriageStatus === AI_TRIAGE_STATUS.completed ? now : undefined),
      aiTriageFailedAt:
        body.aiTriageFailedAt ??
        (aiTriageStatus === AI_TRIAGE_STATUS.failed ? now : undefined),
      aiTriageError: body.aiTriageError,
      aiTriageRunId: body.aiTriageRunId,
      aiTriageRetryCount: body.aiTriageRetryCount,
      aiTriageSource: body.aiTriageSource,
      aiTriageVersion: body.aiTriageVersion,
    };

    const update = removeUndefined({
      ...lifecyclePatch,
      priority: body.priority,
      type: mappedTicketType,
      status: shouldAdvanceStatus ? TICKET_STATUS.processing : undefined,
      aiTriage: body.aiTriage
        ? {
            ...body.aiTriage,
            analyzedAt: body.aiTriage.analyzedAt ?? now,
          }
        : undefined,
    });

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!ticket) throw ApiError.notFound("Ticket not found");

    if (shouldAdvanceStatus && ticket.business) {
      const businessIdStr = String(ticket.business);
      const ticketSlug = ticket.slug;

      void sendAdminTriageCompleteEmail({
        request,
        businessId: businessIdStr,
        ticketSlug,
        ticketTitle: ticket.title,
        ticketPriority: ticket.priority,
        recommendedTicketType: ticket.aiTriage?.recommendedTicketType,
        propertyName: ticket.propertyName,
        unitLabel: ticket.unitLabel,
        needsHumanReview: ticket.aiTriage?.needsHumanReview,
        adminNotes: ticket.aiTriage?.adminNotes,
      }).catch((error) => {
        console.error("[ai-triage] admin email failed", error);
      });

      if (ticket.user) {
        void sendTenantTriageCompleteEmail({
          request,
          businessId: businessIdStr,
          tenantUserId: String(ticket.user),
          ticketSlug,
          ticketTitle: ticket.title,
          ticketPriority: ticket.priority,
          propertyName: ticket.propertyName,
          unitLabel: ticket.unitLabel,
          userReply: ticket.aiTriage?.userReply,
          safetyInstructions: ticket.aiTriage?.safetyInstructions,
          userTroubleshootingSteps: ticket.aiTriage?.userTroubleshootingSteps,
          estimatedResponseWindow: ticket.aiTriage?.estimatedResponseWindow,
          requiresTechnician: ticket.aiTriage?.requiresTechnician,
          immediateActionRequired: ticket.aiTriage?.immediateActionRequired,
        }).catch((error) => {
          console.error("[ai-triage] tenant email failed", error);
        });
      }
    }

    return NextResponse.json({
      status: "success",
      data: ticket,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
