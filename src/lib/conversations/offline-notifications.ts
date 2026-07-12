import "server-only";

import { type IConversation } from "@/models/conversationModel";
import Tradesperson from "@/models/tradespersonModel";
import User from "@/models/userModel";
import Business from "@/models/businessModel";
import Ticket from "@/models/ticketModel";
import { sendTradeSystemEmail } from "@/lib/email/clients/trade-system-email.client";
import {
  CONVERSATION_SENDER_KIND,
  type ConversationSenderKind,
} from "@/features/conversations/models/conversation-types.model";

/**
 * Window after the last read in which the recipient is still considered
 * "online" — we don't email if they were just here.
 *
 * Chosen to be longer than the `markRead` cadence (which fires on mount,
 * on incoming message, on focus) so a user with the thread open is never
 * spammed, but short enough that a closed tab + new message lands in their
 * inbox quickly. 90 seconds matches typical chat platforms.
 */
const STALE_READ_THRESHOLD_MS = 90 * 1000;

type Input = {
  conversation: IConversation;
  /** The senderKind of the just-posted message; we email only the OTHER side. */
  senderKind: ConversationSenderKind;
  /** Message body to preview in the email (truncated). */
  body: string;
  /** Optional app base URL (origin); falls back to env. */
  baseUrl?: string;
};

/**
 * After a message is posted, email the OTHER side if their last-read
 * cursor on this conversation is older than the stale threshold (or they
 * don't have one yet). Skips system messages — those don't deserve their
 * own email; the next user message will catch the recipient up.
 *
 * Fire-and-forget; all failures are caught and logged. Never blocks the
 * write path.
 */
export async function notifyOfflineRecipients(input: Input): Promise<void> {
  if (input.senderKind === CONVERSATION_SENDER_KIND.SYSTEM) return;

  const oppositeKind =
    input.senderKind === CONVERSATION_SENDER_KIND.TRADE
      ? CONVERSATION_SENDER_KIND.MANAGER
      : CONVERSATION_SENDER_KIND.TRADE;

  // For Phase 5 (no presence channels yet), we approximate "offline" via
  // the read-cursor recency on the OPPOSITE side.
  const now = Date.now();
  const oppositeReads = input.conversation.participantReads.filter(
    (p) => p.role === oppositeKind,
  );
  // If anyone on the opposite side has a fresh cursor, the message is
  // likely being delivered live → no email.
  const anyoneOnline = oppositeReads.some(
    (p) => now - p.lastReadAt.getTime() < STALE_READ_THRESHOLD_MS,
  );
  if (anyoneOnline) return;

  // Resolve the email recipient(s). The trade side is one user; the
  // manager side is the workspace's primary admin email.
  const baseUrl =
    input.baseUrl ??
    process.env.APP_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "";
  const preview =
    input.body.length > 140 ? input.body.slice(0, 137) + "…" : input.body;

  if (oppositeKind === CONVERSATION_SENDER_KIND.TRADE) {
    // Manager just posted → notify the trade.
    const trade = await Tradesperson.findById(input.conversation.tradesperson)
      .select("contactEmail businessName")
      .lean<{ contactEmail?: string; businessName?: string }>();
    if (!trade?.contactEmail) return;
    const business = await Business.findById(input.conversation.workspace)
      .select("name")
      .lean<{ name?: string }>();
    const subject = `${business?.name ?? "A workspace"} sent you a message`;
    const link = `${baseUrl}/trades/chat/${input.conversation.id}`;
    await sendTradeSystemEmail({
      to: trade.contactEmail,
      subject,
      preheader: preview,
      bodyText: [
        `${business?.name ?? "A workspace"} just sent you a message on Properly:`,
        ``,
        `"${preview}"`,
        ``,
        `Open the conversation to reply:`,
        link,
      ].join("\n"),
    });
    return;
  }

  // Trade just posted → notify the workspace.
  // Workspaces don't have a single "manager email" baked in; we send to the
  // ticket owner's user (best-available — usually a tenant/manager involved
  // in the repair) and the business primary email if set.
  const ticket = await Ticket.findById(input.conversation.ticket)
    .select("title slug user actionedBy")
    .lean<{
      title?: string;
      slug?: string;
      user?: unknown;
      actionedBy?: unknown;
    }>();
  const recipientUserIds: string[] = [];
  if (ticket?.actionedBy) recipientUserIds.push(String(ticket.actionedBy));
  if (ticket?.user) recipientUserIds.push(String(ticket.user));
  const recipients = recipientUserIds.length
    ? await User.find({ _id: { $in: recipientUserIds } })
        .select("email name")
        .lean<{ email?: string; name?: string }[]>()
    : [];
  const business = await Business.findById(input.conversation.workspace)
    .select("name email")
    .lean<{ name?: string; email?: string }>();
  const emails = Array.from(
    new Set(
      [
        ...recipients.map((r) => r.email).filter(Boolean),
        business?.email,
      ].filter((e): e is string => Boolean(e)),
    ),
  );
  if (emails.length === 0) return;

  const trade = await Tradesperson.findById(input.conversation.tradesperson)
    .select("businessName")
    .lean<{ businessName?: string }>();
  const subject = `${trade?.businessName ?? "A tradesperson"} replied on ${ticket?.title ?? "your repair"}`;
  const link = ticket?.slug
    ? `${baseUrl}/dashboard/tickets/${ticket.slug}`
    : `${baseUrl}/dashboard/tickets`;
  const bodyText = [
    `${trade?.businessName ?? "A tradesperson"} sent a message about ${ticket?.title ?? "a repair"}:`,
    ``,
    `"${preview}"`,
    ``,
    `Open the workspace dashboard to reply:`,
    link,
  ].join("\n");

  await Promise.all(
    emails.map((to) =>
      sendTradeSystemEmail({
        to,
        subject,
        preheader: preview,
        bodyText,
      }),
    ),
  );
}
