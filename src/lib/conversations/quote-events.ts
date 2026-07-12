import "server-only";

import { findOrCreateRepairConversation, postRepairConversationMessage } from "@/lib/conversations/conversation-service";
import {
  CONVERSATION_MESSAGE_TYPE,
  CONVERSATION_SENDER_KIND,
} from "@/features/conversations/models/conversation-types.model";
import type { IRepairQuote } from "@/models/repairQuoteModel";
import type { IRepairRequest } from "@/models/repairRequestModel";

/**
 * Lightweight money formatter for system message bodies — keeps the
 * dependency out of every endpoint that imports the events. We only get
 * here on rare events, so `Intl.NumberFormat` overhead doesn't matter.
 */
function fmt(amountCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(amountCents / 100);
  } catch {
    return `${currency} ${(amountCents / 100).toFixed(2)}`;
  }
}

type QuoteEventBase = {
  repairRequest: IRepairRequest;
  quote: IRepairQuote;
  /** When the trade itself fires the event, we attribute the message to them. */
  triggeredByUserId?: string | null;
};

/** Ensure the (request, trade) conversation exists, then post a system message. */
async function emit(args: QuoteEventBase, body: string, meta?: Record<string, unknown>) {
  const conversation = await findOrCreateRepairConversation({
    workspace: args.repairRequest.workspace,
    ticket: args.repairRequest.ticket,
    repairRequest: args.repairRequest._id as never,
    tradesperson: args.quote.tradesperson,
  });
  await postRepairConversationMessage({
    conversation,
    senderUser: null,
    senderKind: CONVERSATION_SENDER_KIND.SYSTEM,
    type: CONVERSATION_MESSAGE_TYPE.TEXT, // overridden below per event
    body,
    quote: args.quote._id as never,
    meta: meta ?? undefined,
  });
}

export async function emitQuoteSubmittedMessage(args: QuoteEventBase) {
  const amount = fmt(args.quote.amountCents, args.quote.currency);
  await emitTyped(args, CONVERSATION_MESSAGE_TYPE.QUOTE_SUBMITTED, `Submitted a quote of ${amount}.`, {
    amountCents: args.quote.amountCents,
    currency: args.quote.currency,
    quoteStatus: args.quote.status,
  });
}

export async function emitQuoteRevisedMessage(args: QuoteEventBase & {
  previousAmountCents?: number;
}) {
  const amount = fmt(args.quote.amountCents, args.quote.currency);
  const body =
    typeof args.previousAmountCents === "number"
      ? `Revised quote from ${fmt(args.previousAmountCents, args.quote.currency)} to ${amount}.`
      : `Revised quote to ${amount}.`;
  await emitTyped(args, CONVERSATION_MESSAGE_TYPE.QUOTE_REVISED, body, {
    amountCents: args.quote.amountCents,
    previousAmountCents: args.previousAmountCents,
    currency: args.quote.currency,
    quoteStatus: args.quote.status,
  });
}

export async function emitQuoteAcceptedMessage(args: QuoteEventBase) {
  await emitTyped(
    args,
    CONVERSATION_MESSAGE_TYPE.QUOTE_ACCEPTED,
    `Quote of ${fmt(args.quote.amountCents, args.quote.currency)} accepted — ticket assigned.`,
    {
      amountCents: args.quote.amountCents,
      currency: args.quote.currency,
      quoteStatus: args.quote.status,
    },
  );
}

export async function emitQuoteDeclinedMessage(args: QuoteEventBase) {
  await emitTyped(args, CONVERSATION_MESSAGE_TYPE.QUOTE_DECLINED, `Quote declined.`, {
    quoteStatus: args.quote.status,
  });
}

export async function emitQuoteWithdrawnMessage(args: QuoteEventBase) {
  await emitTyped(args, CONVERSATION_MESSAGE_TYPE.QUOTE_WITHDRAWN, `Trade withdrew the quote.`, {
    quoteStatus: args.quote.status,
  });
}

// Internal: same as emit() but with the right discriminated message type.
async function emitTyped(
  args: QuoteEventBase,
  type: typeof CONVERSATION_MESSAGE_TYPE[keyof typeof CONVERSATION_MESSAGE_TYPE],
  body: string,
  meta?: Record<string, unknown>,
) {
  const conversation = await findOrCreateRepairConversation({
    workspace: args.repairRequest.workspace,
    ticket: args.repairRequest.ticket,
    repairRequest: args.repairRequest._id as never,
    tradesperson: args.quote.tradesperson,
  });
  await postRepairConversationMessage({
    conversation,
    senderUser: null,
    senderKind: CONVERSATION_SENDER_KIND.SYSTEM,
    type,
    body,
    quote: args.quote._id as never,
    meta,
  });
}

// Silence the unused `emit` helper — kept for potential future plain-text
// system messages that aren't quote-related.
void emit;
