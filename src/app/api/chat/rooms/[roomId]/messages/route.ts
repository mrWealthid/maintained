// app/api/chat/rooms/[roomId]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import ChatMessage from "@/models/chatMessage";
import chatRoom from "@/models/chatRoom";
import { assertRoomAccess } from "@/lib/chat/chatAuth";
import { pusherServer } from "@/lib/pusher/pusher";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { CHAT_TYPE } from "@/features/chat-feat/data/enums";
import APIFeatures from "@/utils/apiFeatures";
import { mapToObject } from "@/utils/helpers";
import { ChatRoomMessage } from "@/features/chat-feat/model/chat.model";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();

    const { roomId } = await params;
    await assertRoomAccess(roomId, verify.id);

    const transformedQuery = mapToObject(
      request.nextUrl.searchParams as unknown as Map<string, string>,
    );

    const filter = { room: roomId };
    const chatRequestQuery = ChatMessage.find(filter);

    const features = new APIFeatures(chatRequestQuery, transformedQuery)
      .filter()
      .sort("_id")
      .limitFields()
      .paginate()
      .populate({ path: "sender", select: "name" });

    const requests = await features.query;

    const countFeatures = new APIFeatures<ChatRoomMessage>(
      ChatMessage.find(filter),
      transformedQuery,
    ).filter();

    const count = await countFeatures.query.countDocuments();

    return NextResponse.json(
      {
        totalRecords: count,
        results: requests.length,
        status: "success",
        data: requests,
      },
      { status: 200 },
    );
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();

    const { roomId } = await params;
    const socketId = req.headers.get("x-socket-id") ?? undefined;

    await assertRoomAccess(roomId, verify.id);

    const { message } = await req.json();
    if (!message || !message.trim()) {
      throw ApiError.badRequest("Empty message");
    }

    const room = await chatRoom.findById(roomId);
    if (!room) throw ApiError.notFound("Room not found");

    const participantIds = room.participants.map(
      (p: { user: string }) => new Types.ObjectId(p.user),
    );
    const receipts = participantIds.map((uid: Types.ObjectId) => ({
      userId: uid,
    }));

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
      { socket_id: socketId },
    );

    return NextResponse.json(
      { status: "success", message: "Message sent successfully", data: msg },
      { status: 201 },
    );
  } catch (error) {
    return errorToNextResponse(error, req.headers.get("x-request-id"));
  }
}
