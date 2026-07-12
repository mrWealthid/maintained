import mongoose, { Schema, Model, Document, Types } from "mongoose";

import {
  CONVERSATION_SENDER_KIND,
  CONVERSATION_SENDER_KIND_VALUES,
  type ConversationSenderKind,
} from "@/features/conversations/models/conversation-types.model";

export interface IConversationParticipantRead {
  user: Types.ObjectId;
  /** Which side of the conversation this user is on. */
  role: Exclude<ConversationSenderKind, "system">;
  lastReadAt: Date;
}

export interface IConversation extends Document {
  workspace: Types.ObjectId;
  ticket: Types.ObjectId;
  repairRequest: Types.ObjectId;
  /** The single Tradesperson on the other side of this thread. */
  tradesperson: Types.ObjectId;

  /** Convenience preview for inbox rows. Updated on each new message. */
  lastMessageAt?: Date;
  lastMessagePreview?: string;

  /**
   * Per-user read cursors. One row per `user`. The manager side may have
   * many readers (everyone in the workspace with the perm); the trade side
   * is typically a single user but stored the same way for symmetry.
   */
  participantReads: Types.DocumentArray<IConversationParticipantRead>;

  createdAt: Date;
  updatedAt: Date;
}

const participantReadSchema = new Schema<IConversationParticipantRead>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: CONVERSATION_SENDER_KIND_VALUES.filter(
        (v) => v !== CONVERSATION_SENDER_KIND.SYSTEM,
      ),
      required: true,
    },
    lastReadAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false },
);

const conversationSchema = new Schema<IConversation>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    repairRequest: {
      type: Schema.Types.ObjectId,
      ref: "RepairRequest",
      required: true,
      index: true,
    },
    tradesperson: {
      type: Schema.Types.ObjectId,
      ref: "Tradesperson",
      required: true,
      index: true,
    },

    lastMessageAt: { type: Date, index: true },
    lastMessagePreview: { type: String, trim: true, maxlength: 200 },

    participantReads: { type: [participantReadSchema], default: [] },
  },
  { timestamps: true },
);

// One conversation per (repairRequest, tradesperson) — matches eventSphere.
conversationSchema.index(
  { repairRequest: 1, tradesperson: 1 },
  { unique: true },
);

const Conversation: Model<IConversation> =
  (mongoose.models.Conversation as Model<IConversation>) ||
  mongoose.model<IConversation>("Conversation", conversationSchema);

export default Conversation;
