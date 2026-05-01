// app/api/chat/rooms/[roomId]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import "@/models/chatRoom";
import "@/models/chatMessage";
import ChatRoom from "@/models/chatRoom";
import ChatRoomMessage from "@/models/chatMessage";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { pusherServer } from "@/lib/pusher/pusher";

type Body = { lastReadMessageId?: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const me = await getUserFromCookies();
    if (!me?.id) throw ApiError.unauthorized();

    const { roomId } = await params;
    if (!Types.ObjectId.isValid(roomId)) {
      throw ApiError.badRequest("Invalid room id");
    }

    const { lastReadMessageId }: Body = await req.json();
    if (!lastReadMessageId || !Types.ObjectId.isValid(lastReadMessageId)) {
      throw ApiError.badRequest("Invalid lastReadMessageId");
    }

    const room = await ChatRoom.findById(roomId);
    if (!room) throw ApiError.notFound("Room not found");

    const isParticipant = room.participants.some(
      (p: { user: unknown }) => String(p.user) === String(me.id),
    );
    if (!isParticipant) throw ApiError.forbidden();

    const meObjId = new Types.ObjectId(me.id);
    const lastId = new Types.ObjectId(lastReadMessageId);

    await ChatRoom.updateOne(
      { _id: roomId, "participants.user": meObjId },
      {
        $set: {
          "participants.$.lastReadMessageId": lastId,
          "participants.$.lastActiveAt": new Date(),
        },
      },
    );

    await ChatRoomMessage.updateMany(
      {
        room: roomId,
        _id: { $lte: lastId },
        "receipts.userId": meObjId,
        "receipts.readAt": { $exists: false },
      },
      { $set: { "receipts.$[r].readAt": new Date() } },
      {
        arrayFilters: [{ "r.userId": meObjId, "r.readAt": { $exists: false } }],
      },
    );

    const affected = await ChatRoomMessage.find({
      room: roomId,
      _id: { $lte: lastId },
    })
      .select({ _id: 1 })
      .sort({ _id: 1 })
      .lean();

    const channel = `private-room-${roomId}`;
    await Promise.all(
      affected.map((m: { _id: unknown }) =>
        pusherServer.trigger(channel, "message:read", {
          id: String(m._id),
          readerId: String(me.id),
        }),
      ),
    );

    return NextResponse.json({
      status: "success",
      message: "Read status updated",
      data: {
        lastReadMessageId: String(lastReadMessageId),
        count: affected.length,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, req.headers.get("x-request-id"));
  }
}
