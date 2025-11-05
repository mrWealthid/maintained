// app/api/chat/rooms/[roomId]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import ChatMessage from "@/models/chatMessage";
// import { authUserOrThrow } from "@/lib/auth";
import { assertRoomAccess } from "@/lib/chat/chatAuth";
import { pusherServer } from "@/lib/pusher/pusher";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { CHAT_TYPE } from "@/features/chat-feat/data/enums";
import APIFeatures from "@/utils/apiFeatures";
import { mapToObject } from "@/utils/helpers";
import chatRoom from "@/models/chatRoom";
import { Types } from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const verify = await getUserFromCookies();
  const { roomId } = await params;

  if (!verify) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  const query: any = { ...request.nextUrl.searchParams };

  const transformedQuery = mapToObject(query);

  await assertRoomAccess(roomId, verify.id);

  const filter = { room: roomId };

  const chatRequestQuery = ChatMessage.find(filter);

  const features = new APIFeatures(chatRequestQuery, transformedQuery)
    .filter()
    .sort("_id")
    .limitFields()
    .paginate()
    .populate({ path: "sender", select: "name" });

  const requests = await features.query;

  let count;

  // console.log( await Model.find(req.query))

  //I did this because pagination of filtered data was impossible, The endpoint keeps returning the total count of all document

  if (Object.values(transformedQuery).length > 0) {
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete transformedQuery[el]);
    count = await ChatMessage.find(filter)
      .find(transformedQuery)
      .countDocuments();
  } else {
    count = await ChatMessage.countDocuments(filter);
  }

  const response = NextResponse.json(
    {
      totalRecords: count,
      results: requests.length,
      status: "success",
      data: requests,
    },
    { status: 200 }
  );

  return response;
}
export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const verify = await getUserFromCookies();
  const { roomId } = await params;

  const socketId = req.headers.get("x-socket-id") ?? undefined;

  if (!verify) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await assertRoomAccess(roomId, verify.id);

  const { message } = await req.json();
  if (!message || !message.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const room = await chatRoom.findById(roomId);
  if (!room)
    return NextResponse.json({ error: "Room not found" }, { status: 404 });

  // const isParticipant = room.participants.some(
  //   (p: any) => String(p.user) === String(verify.id)
  // );

  // console.log(verify.user);

  // const msg = await ChatMessage.create({
  //   room: roomId,
  //   sender: verify.id,
  //   type: CHAT_TYPE.USER,
  //   text: message.trim(),
  //   readBy: [verify.id],
  // });

  const participantIds = room.participants.map(
    (p: { user: string }) => new Types.ObjectId(p.user)
  );
  const receipts = participantIds.map((uid: Types.ObjectId) => ({
    userId: uid,
  })); // deliveredAt/readAt empty

  const msg = await ChatMessage.create({
    room: roomId,
    sender: verify.id,
    type: CHAT_TYPE.USER,
    text: message.trim(),
    receipts,
  });

  await msg.populate({ path: "sender", select: "_id name photo" });
  await pusherServer.trigger(
    `private-room-${roomId}`,
    "message:new",
    {
      _id: msg._id,
      sender: {
        id: verify.id,
        name: verify.user.name,
      },
      text: msg.text,
      createdAt: msg.createdAt,
      room: roomId,
    },
    { socket_id: socketId }
  );

  return NextResponse.json(
    {
      status: "success",
      message: "Message sent successfully",
      data: msg,
    },
    { status: 201 }
  );
}
