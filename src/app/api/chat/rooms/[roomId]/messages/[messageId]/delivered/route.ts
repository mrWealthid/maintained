// app/api/chat/rooms/[roomId]/messages/[messageId]/delivered/route.ts
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import ChatRoom from "@/models/chatRoom";
import ChatMessage from "@/models/chatMessage";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { pusherServer } from "@/lib/pusher/pusher";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ roomId: string; messageId: string }> }
) {
  try {
    const me = await getUserFromCookies();
    if (!me?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roomId, messageId } = await params;
    if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    }

    // membership check
    const room = await ChatRoom.findById(roomId).lean();
    if (!room)
      return NextResponse.json({ error: "Room not found" }, { status: 404 });

    // Ensure room.participants exists and is an array
    const participants = Array.isArray((room as any).participants)
      ? (room as any).participants
      : [];
    const isParticipant = participants.some(
      (p: any) => String(p.user) === String(me.id)
    );
    if (!isParticipant)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const meId = new Types.ObjectId(me.id);
    const now = new Date();

    // ensure receipt exists for me
    await ChatMessage.updateOne(
      { _id: messageId, room: roomId, "receipts.userId": { $ne: meId } },
      { $addToSet: { receipts: { userId: meId } } }
    );

    // set deliveredAt if missing
    await ChatMessage.updateOne(
      {
        _id: messageId,
        room: roomId,
        "receipts.userId": meId,
        "receipts.deliveredAt": { $exists: false },
      },
      { $set: { "receipts.$.deliveredAt": now } }
    );

    // fan-out
    const pusher = pusherServer;
    await pusher.trigger(`private-room-${roomId}`, "message:delivered", {
      id: String(messageId),
      userId: String(me.id),
    });

    return NextResponse.json({
      status: "success",
      message: "Message marked delivered",
      data: { id: String(messageId) },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
