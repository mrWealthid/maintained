import "server-only";
import { Types } from "mongoose";

import Conversation, { type IConversation } from "@/models/conversationModel";
import ConversationMessage, {
  type IConversationMessage,
  type IConversationMessageMeta,
} from "@/models/conversationMessageModel";
import { pusherServer } from "@/lib/pusher/server";
import {
  CONVERSATION_MESSAGE_TYPE,
  CONVERSATION_SENDER_KIND,
  type ConversationMessageType,
  type ConversationSenderKind,
} from "@/features/conversations/models/conversation-types.model";
import { notifyOfflineRecipients } from "./offline-notifications";

/**
 * Private Pusher channel naming convention. We deliberately prefix with
 * `private-repair-conversation-` instead of `private-conversation-` so it
 * doesn't collide with any future generic conversation channel (and so
 * /api/pusher/auth doesn't have to special-case anything for now).
 */
export function repairConversationChannel(conversationId: string): string {
  return `private-repair-conversation-${conversationId}`;
}

export const REPAIR_CONVERSATION_EVENTS = {
  MESSAGE_NEW: "message.new",
  READ_UPDATE: "read.update",
  TYPING_UPDATE: "typing.update",
} as const;

type FindOrCreateInput = {
  workspace: Types.ObjectId | string;
  ticket: Types.ObjectId | string;
  repairRequest: Types.ObjectId | string;
  tradesperson: Types.ObjectId | string;
};

/**
 * Single entry point for resolving "the conversation for this (request,
 * trade) pair". Creates one on first call; idempotent thereafter. Used by
 * the conversation API and by the Phase 3 quote handlers when they fire
 * system messages.
 */
export async function findOrCreateRepairConversation(
  input: FindOrCreateInput,
): Promise<IConversation> {
  const filter = {
    repairRequest: input.repairRequest,
    tradesperson: input.tradesperson,
  };
  const existing = await Conversation.findOne(filter);
  if (existing) return existing;

  // Race-safe create: the unique index on (repairRequest, tradesperson)
  // means a parallel call will fail with E11000; we then re-read.
  try {
    return await Conversation.create({
      workspace: input.workspace,
      ticket: input.ticket,
      repairRequest: input.repairRequest,
      tradesperson: input.tradesperson,
    });
  } catch (err: unknown) {
    const code = (err as { code?: number } | undefined)?.code;
    if (code === 11000) {
      const fallback = await Conversation.findOne(filter);
      if (fallback) return fallback;
    }
    throw err;
  }
}

type PostMessageInput = {
  conversation: IConversation;
  senderUser: Types.ObjectId | string | null;
  senderKind: ConversationSenderKind;
  type?: ConversationMessageType;
  body: string;
  quote?: Types.ObjectId | string | null;
  meta?: IConversationMessageMeta;
};

/**
 * Insert a new message into a conversation, update the conversation's
 * preview / lastMessageAt, advance the sender's own read cursor, and fire a
 * Pusher event so subscribed clients can render the new message live.
 *
 * Pusher failures never break the write — we log and move on. The client
 * will pick up the message on its next poll / refresh.
 */
export async function postRepairConversationMessage(
  input: PostMessageInput,
): Promise<IConversationMessage> {
  const truncated = input.body.length > 200
    ? input.body.slice(0, 197) + "…"
    : input.body;

  const message = await ConversationMessage.create({
    conversation: input.conversation._id,
    senderUser: input.senderUser ?? null,
    senderKind: input.senderKind,
    type: input.type ?? CONVERSATION_MESSAGE_TYPE.TEXT,
    body: input.body,
    quote: input.quote ?? null,
    meta: input.meta,
  });

  input.conversation.lastMessageAt = message.createdAt;
  input.conversation.lastMessagePreview = truncated;

  // Advance sender's read cursor so their own message isn't "unread" for them.
  if (
    input.senderUser &&
    input.senderKind !== CONVERSATION_SENDER_KIND.SYSTEM
  ) {
    const senderId = String(input.senderUser);
    const existing = input.conversation.participantReads.find(
      (p) => String(p.user) === senderId,
    );
    if (existing) {
      existing.lastReadAt = message.createdAt;
    } else {
      input.conversation.participantReads.push({
        user: new Types.ObjectId(senderId),
        role: input.senderKind as Exclude<ConversationSenderKind, "system">,
        lastReadAt: message.createdAt,
      });
    }
  }

  await input.conversation.save();

  // Best-effort realtime broadcast. Pusher env vars may be unset in dev —
  // swallow errors so writes don't fail when realtime is offline.
  try {
    await pusherServer.trigger(
      repairConversationChannel(input.conversation.id),
      REPAIR_CONVERSATION_EVENTS.MESSAGE_NEW,
      {
        _id: message.id,
        conversation: input.conversation.id,
        senderUser: message.senderUser ? String(message.senderUser) : null,
        senderKind: message.senderKind,
        type: message.type,
        body: message.body,
        quote: message.quote ? String(message.quote) : null,
        meta: message.meta ?? null,
        createdAt: message.createdAt,
      },
    );
  } catch (err) {
    console.error("[repair-conversation] pusher trigger failed", err);
  }

  // Best-effort offline notification: if the OTHER side hasn't read the
  // thread recently, email them so they don't miss the message.
  void notifyOfflineRecipients({
    conversation: input.conversation,
    senderKind: input.senderKind,
    body: input.body,
  }).catch((err) =>
    console.error("[repair-conversation] offline notify failed", err),
  );

  return message;
}

/**
 * Mark this conversation as read for `userId` (with their `role` on this
 * thread). Updates the cursor in-place if it exists, otherwise inserts it.
 * Returns the resolved cursor timestamp so the API can echo it back.
 */
export async function markRepairConversationRead(args: {
  conversation: IConversation;
  userId: string;
  role: Exclude<ConversationSenderKind, "system">;
}): Promise<Date> {
  const now = new Date();
  const existing = args.conversation.participantReads.find(
    (p) => String(p.user) === args.userId,
  );
  if (existing) {
    existing.lastReadAt = now;
  } else {
    args.conversation.participantReads.push({
      user: new Types.ObjectId(args.userId),
      role: args.role,
      lastReadAt: now,
    });
  }
  await args.conversation.save();
  return now;
}
