// app/api/chat/rooms/[roomId]/messages/route.ts
import { NextResponse } from "next/server";
import ChatMessage from "@/models/chatMessage";
// import { authUserOrThrow } from "@/lib/auth";
import { assertRoomAccess } from "@/lib/chat/chatAuth";
import { pusherServer } from "@/lib/pusher/pusher";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { CHAT_TYPE } from "@/app/(users)/dashboard/chat/data/enums";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const verify = await getUserFromCookies();
  const { roomId } = await params;

  if (!verify) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await assertRoomAccess(roomId, verify.id);

  const messages = await ChatMessage.find({ room: roomId })
    .populate({ path: "sender", select: "name" })
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json({ data: messages.reverse() }, { status: 200 });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const verify = await getUserFromCookies();
  const { roomId } = await params;

  if (!verify) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await assertRoomAccess(roomId, verify.id);

  const { message } = await req.json();
  if (!message || !message.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const msg = await ChatMessage.create({
    room: roomId,
    sender: verify.id,
    type: CHAT_TYPE.USER,
    text: message.trim(),
    readBy: [verify.id],
  });

  await pusherServer.trigger(`room-${roomId}`, "message:new", {
    _id: msg._id,
    sender: verify.id,
    text: msg.text,
    createdAt: msg.createdAt,
  });

  return NextResponse.json(
    { status: "success", message: "Message sent successfully", data: msg },
    { status: 201 }
  );
}
