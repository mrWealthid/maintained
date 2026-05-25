import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import {
  ticketAiTriageSchema,
  ticketAiTriageWorkflowSchema,
} from "@/features/tickets/models/ticket-form.model";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import Ticket from "@/models/ticketModel";
import { AI_TRIAGE_STATUS, TICKET_PRIORITY } from "@/shared/enums/enums";

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
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    await connect();
    assertInternalWebhookAuth(request);

    const { ticketId } = await params;
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw ApiError.badRequest("Invalid ticket id");
    }

    const body = parseOrThrow(
      internalAiTriageBodySchema,
      await request.json(),
    );
    const now = new Date();
    const aiTriageStatus = body.aiTriageStatus;

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

    return NextResponse.json({
      status: "success",
      data: ticket,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
