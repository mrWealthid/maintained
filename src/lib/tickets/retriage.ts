import "server-only";
import type { HydratedDocument } from "mongoose";

import type { ITicket } from "@/models/ticketModel";
import { AI_TRIAGE_STATUS } from "@/shared/enums/enums";
import { triggerAiTriageWebhook } from "./ai-triage-webhook";

export const MAX_RETRIAGE_ATTEMPTS = 3;

export function isTriageInFlight(status?: AI_TRIAGE_STATUS) {
  return (
    status === AI_TRIAGE_STATUS.pending ||
    status === AI_TRIAGE_STATUS.processing
  );
}

export function hasReTriageAttemptsLeft(retryCount?: number) {
  return (retryCount ?? 0) < MAX_RETRIAGE_ATTEMPTS;
}

// Resets the ticket's triage lifecycle to PENDING and re-fires the webhook so
// the existing n8n → Flowise → callback flow overwrites the result. The prior
// missingInformation is forwarded so the agent knows what was just supplied.
export async function runReTriage(ticket: HydratedDocument<ITicket>) {
  const priorMissingInformation = ticket.aiTriage?.missingInformation ?? [];

  ticket.aiTriageStatus = AI_TRIAGE_STATUS.pending;
  ticket.aiTriageRetryCount = (ticket.aiTriageRetryCount ?? 0) + 1;
  ticket.aiTriageError = undefined;
  ticket.aiTriageStartedAt = undefined;
  ticket.aiTriageCompletedAt = undefined;
  ticket.aiTriageFailedAt = undefined;
  await ticket.save();

  const result = await triggerAiTriageWebhook({
    ticketId: String(ticket._id),
    title: ticket.title,
    description: ticket.description,
    area: ticket.area,
    category: String(ticket.category),
    property: String(ticket.property),
    unit: String(ticket.unit),
    images: ticket.images,
    videos: ticket.videos,
    documents: ticket.documents,
    isReTriage: true,
    priorMissingInformation,
  });

  if (!result.sent && "error" in result) {
    ticket.aiTriageStatus = AI_TRIAGE_STATUS.failed;
    ticket.aiTriageFailedAt = new Date();
    ticket.aiTriageError = result.error;
    await ticket.save();
  }

  return result;
}
