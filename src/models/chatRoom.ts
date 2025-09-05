import { Schema, model, Types, models } from "mongoose";

export interface IChatRoom {
  _id: Types.ObjectId;
  ticket: Types.ObjectId;
  participants: {
    user: Types.ObjectId;
    role: "REQUESTER" | "TECHNICIAN" | "ADMIN";
    joinedAt: Date;

    /** New: fast unread + “read-up-to” */
    lastReadMessageId?: Types.ObjectId | null;
    lastActiveAt?: Date | null;
  }[];
  lastMessageAt?: Date;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["REQUESTER", "TECHNICIAN", "ADMIN"],
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },

    lastReadMessageId: {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
      default: null,
    },
    lastActiveAt: { type: Date, default: null },
  },
  { _id: false }
);

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      unique: true,
      required: true,
    },
    participants: { type: [ParticipantSchema], default: [] },
    lastMessageAt: Date,
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Helpful indexes
ChatRoomSchema.index({ "participants.user": 1 });
// ChatRoomSchema.index({ ticket: 1 });

export default models.ChatRoom || model<IChatRoom>("ChatRoom", ChatRoomSchema);
