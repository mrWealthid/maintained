import mongoose, { Schema, Model, Document, Types } from "mongoose";

import {
  CONVERSATION_MESSAGE_TYPE,
  CONVERSATION_MESSAGE_TYPE_VALUES,
  CONVERSATION_SENDER_KIND,
  CONVERSATION_SENDER_KIND_VALUES,
  type ConversationMessageType,
  type ConversationSenderKind,
} from "@/features/conversations/models/conversation-types.model";

/**
 * Structured payload attached to system messages. Lets clients render rich
 * UI (amount, status pill, etc.) without re-fetching the quote.
 *
 * Free-form on purpose; future system message types can add their own
 * fields without a migration.
 */
export interface IConversationMessageMeta {
  amountCents?: number;
  currency?: string;
  /** When a quote_revised is fired, the previous amount for the diff display. */
  previousAmountCents?: number;
  quoteStatus?: string;
  ticketSlug?: string;
  [key: string]: unknown;
}

export interface IConversationMessage extends Document {
  conversation: Types.ObjectId;

  /** Null for system messages. */
  senderUser?: Types.ObjectId | null;
  senderKind: ConversationSenderKind;

  type: ConversationMessageType;
  body: string;
  /** Optional reference to the RepairQuote a system message is about. */
  quote?: Types.ObjectId | null;
  meta?: IConversationMessageMeta;

  createdAt: Date;
  updatedAt: Date;
}

const conversationMessageSchema = new Schema<IConversationMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    senderKind: {
      type: String,
      enum: CONVERSATION_SENDER_KIND_VALUES,
      required: true,
    },

    type: {
      type: String,
      enum: CONVERSATION_MESSAGE_TYPE_VALUES,
      required: true,
      default: CONVERSATION_MESSAGE_TYPE.TEXT,
    },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    quote: {
      type: Schema.Types.ObjectId,
      ref: "RepairQuote",
      default: null,
    },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

// Common thread read: conversation ordered by createdAt.
conversationMessageSchema.index({ conversation: 1, createdAt: 1 });

const ConversationMessage: Model<IConversationMessage> =
  (mongoose.models.ConversationMessage as Model<IConversationMessage>) ||
  mongoose.model<IConversationMessage>(
    "ConversationMessage",
    conversationMessageSchema,
  );

export const CONVERSATION_SYSTEM_SENDER = CONVERSATION_SENDER_KIND.SYSTEM;
export default ConversationMessage;
