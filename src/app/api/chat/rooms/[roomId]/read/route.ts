// app/api/chat/rooms/[roomId]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import "@/models/chatRoom";
import "@/models/chatMessage";
import ChatRoom from "@/models/chatRoom";
import ChatRoomMessage from "@/models/chatMessage";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { pusherServer } from "@/lib/pusher/pusher";

type Body = { lastReadMessageId?: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const me = await getUserFromCookies();
    if (!me?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roomId } = await params;
    if (!Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
    }

    const { lastReadMessageId }: Body = await req.json();
    if (!lastReadMessageId || !Types.ObjectId.isValid(lastReadMessageId)) {
      return NextResponse.json(
        { error: "Invalid lastReadMessageId" },
        { status: 400 }
      );
    }

    // Ensure membership
    const room = await ChatRoom.findById(roomId);
    if (!room)
      return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const isParticipant = room.participants.some(
      (p: any) => String(p.user) === String(me.id)
    );
    if (!isParticipant)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const meObjId = new Types.ObjectId(me.id);
    const lastId = new Types.ObjectId(lastReadMessageId);

    // Update participant read cursor
    await ChatRoom.updateOne(
      { _id: roomId, "participants.user": meObjId },
      {
        $set: {
          "participants.$.lastReadMessageId": lastId,
          "participants.$.lastActiveAt": new Date(),
        },
      }
    );

    // Mark readAt for this user for all <= lastId in this room
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
      }
    );

    // Fetch affected message ids to broadcast per-message (fits your client `onRead`)
    const affected = await ChatRoomMessage.find({
      room: roomId,
      _id: { $lte: lastId },
    })
      .select({ _id: 1 })
      .sort({ _id: 1 })
      .lean();

    const pusher = pusherServer;
    const channel = `private-room-${roomId}`;
    // Emit one event per message so your current onRead({ id, readerId }) works unchanged
    await Promise.all(
      affected.map((m: any) =>
        pusher.trigger(channel, "message:read", {
          id: String(m._id),
          readerId: String(me.id),
        })
      )
    );

    return NextResponse.json({
      status: "success",
      message: "Read status updated",
      data: {
        lastReadMessageId: String(lastReadMessageId),
        count: affected.length,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
