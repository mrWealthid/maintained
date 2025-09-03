// models/ChatMessage.ts
import { CHAT_TYPE } from "@/app/shared/chat-feat/data/enums";
import mongoose, { Schema, Types } from "mongoose";

export interface IChatMessage {
  room: Types.ObjectId;
  sender: Types.ObjectId | null; // null for system
  type: CHAT_TYPE;
  text?: string;
  meta?: Record<string, any>;
  readBy: Types.ObjectId[];
  // senderRole:
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      index: true,
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      enum: [CHAT_TYPE.USER, CHAT_TYPE.SYSTEM],
      default: CHAT_TYPE.USER,
    },
    text: String,
    meta: Schema.Types.Mixed,
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

// ChatMessageSchema.set("toJSON", {
//   virtuals: true,
//   versionKey: false,
//   transform: function (_doc, ret: Record<string, any>) {
//     ret.id = ret._id?.toString();
//     delete ret._id;
//   },
// });

ChatMessageSchema.index({ room: 1, createdAt: 1 });

export default mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", ChatMessageSchema);
