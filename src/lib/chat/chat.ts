// lib/chat.ts
import ChatRoom from "@/models/chatRoom";
import ChatMessage from "@/models/chatMessage";
import { Types } from "mongoose";

type Participant = {
  user: Types.ObjectId;
  role: "REQUESTER" | "TECHNICIAN" | "ADMIN";
};

export async function ensureTicketRoom({
  ticketId,
  requesterId,
  technicianId,
  adminId,
  sysText,
}: {
  ticketId: Types.ObjectId;
  requesterId: Types.ObjectId;
  technicianId: Types.ObjectId;
  adminId: Types.ObjectId;
  sysText: string; // e.g., "Technician X assigned by Admin Y"
}) {
  const baseParticipants: Participant[] = [
    { user: requesterId, role: "REQUESTER" },
    { user: technicianId, role: "TECHNICIAN" },
    { user: adminId, role: "ADMIN" },
  ];

  // Create or update room idempotently
  const room = await ChatRoom.findOneAndUpdate(
    { ticket: ticketId },
    {
      $setOnInsert: { ticket: ticketId, isArchived: false },
      $set: { lastMessageAt: new Date() },
      $addToSet: {
        participants: baseParticipants.map((p) => ({
          ...p,
          joinedAt: new Date(),
        })),
      },
    },
    { new: true, upsert: true }
  );

  // System message
  const msg = await ChatMessage.create({
    room: room._id,
    sender: null,
    type: "SYSTEM",
    text: sysText,
    meta: { ticketId, technicianId, adminId },
  });

  return { room, msg };
}
