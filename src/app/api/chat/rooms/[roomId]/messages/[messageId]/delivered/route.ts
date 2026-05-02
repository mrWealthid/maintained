// app/api/chat/rooms/[roomId]/messages/[messageId]/delivered/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import ChatRoom from "@/models/chatRoom";
import ChatMessage from "@/models/chatMessage";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { pusherServer } from "@/lib/pusher/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string; messageId: string }> },
) {
  try {
    const me = await getUserFromCookies();
    if (!me?.id) throw ApiError.unauthorized();

    const { roomId, messageId } = await params;
    if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(messageId)) {
      throw ApiError.badRequest("Invalid ids");
    }

    const room = await ChatRoom.findById(roomId).lean();
    if (!room) throw ApiError.notFound("Room not found");

    const roomRecord = room as unknown as { participants?: { user: unknown }[] };
    const participants = Array.isArray(roomRecord.participants)
      ? roomRecord.participants
      : [];
    const isParticipant = participants.some(
      (p) => String(p.user) === String(me.id),
    );
    if (!isParticipant) throw ApiError.forbidden();

    const meId = new Types.ObjectId(me.id);
    const now = new Date();

    await ChatMessage.updateOne(
      { _id: messageId, room: roomId, "receipts.userId": { $ne: meId } },
      { $addToSet: { receipts: { userId: meId } } },
    );

    await ChatMessage.updateOne(
      {
        _id: messageId,
        room: roomId,
        "receipts.userId": meId,
        "receipts.deliveredAt": { $exists: false },
      },
      { $set: { "receipts.$.deliveredAt": now } },
    );

    await pusherServer.trigger(`private-room-${roomId}`, "message:delivered", {
      id: String(messageId),
      userId: String(me.id),
    });

    return NextResponse.json({
      status: "success",
      message: "Message marked delivered",
      data: { id: String(messageId) },
    });
  } catch (error) {
    return errorToNextResponse(error, req.headers.get("x-request-id"));
  }
}
