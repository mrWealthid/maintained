// models/ChatRoom.ts
import mongoose, { Schema, Types } from "mongoose";

export interface IChatRoom {
  ticket: Types.ObjectId;
  participants: {
    user: Types.ObjectId;
    role: "REQUESTER" | "TECHNICIAN" | "ADMIN";
    joinedAt: Date;
  }[];
  lastMessageAt?: Date;
  isArchived?: boolean;
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      unique: true,
      index: true,
      required: true,
    },
    participants: [
      {
        _id: false,
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["REQUESTER", "TECHNICIAN", "ADMIN"],
          required: true,
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    lastMessageAt: Date,
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// indexes
ChatRoomSchema.index({ "participants.user": 1 });

// // single toJSON transform (once)
// ChatRoomSchema.set("toJSON", {
//   virtuals: true,
//   versionKey: false,
//   transform: function (_doc, ret: Record<string, any>) {
//     ret.id = ret._id?.toString();
//     delete ret._id;
//   },
// });

const ChatRoom =
  (mongoose.models.ChatRoom as mongoose.Model<IChatRoom>) ||
  mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);

export default ChatRoom;
