import { Schema, model, Types, models } from "mongoose";

export enum CHAT_TYPE {
  USER = "USER",
  SYSTEM = "SYSTEM",
}

export interface IChatMessage {
  _id: Types.ObjectId;
  room: Types.ObjectId;
  sender: Types.ObjectId | null;
  type: CHAT_TYPE;
  text?: string;
  meta?: any;

  /** Legacy for compatibility with old “seen” UI */
  readBy: Types.ObjectId[];

  /** New: per-recipient receipts */
  receipts: {
    userId: Types.ObjectId;
    deliveredAt?: Date;
    readAt?: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveredAt: { type: Date },
    readAt: { type: Date },
  },
  { _id: false }
);

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
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

    // keep existing behavior
    readBy: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],

    // new receipts
    receipts: { type: [ReceiptSchema], default: [] },
  },
  { timestamps: true }
);

// Helpful indexes
ChatMessageSchema.index({ room: 1, createdAt: 1 });
ChatMessageSchema.index({ room: 1, _id: 1 });
ChatMessageSchema.index({ "receipts.userId": 1 });

export default models.ChatMessage ||
  model<IChatMessage>("ChatMessage", ChatMessageSchema);
