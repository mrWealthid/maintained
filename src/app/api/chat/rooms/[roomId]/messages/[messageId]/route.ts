// src/app/api/chat/rooms/[roomId]/messages/[messageId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { pusherServer } from "@/lib/pusher/pusher";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import ChatMessage from "@/models/chatMessage";
import { assertRoomAccess } from "@/lib/chat/chatAuth";
import { CHAT_TYPE } from "@/features/chat-feat/data/enums";
import { z } from "zod";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

export const runtime = "nodejs";

const editMessageBodySchema = z.object({
  message: z.string().trim().min(1, "Message is required"),
});

function assertValidIds(roomId: string, messageId: string) {
  if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(messageId)) {
    throw ApiError.badRequest("Invalid id(s)");
  }
}

function canModifyMessage(
  verify: { id: string; isAdminRole?: boolean; isSuperAdminRole?: boolean },
  message: { sender?: unknown },
) {
  const isSender = String(message.sender) === String(verify.id);
  const isAdmin = !!verify.isAdminRole || !!verify.isSuperAdminRole;
  return isSender || isAdmin;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string; messageId: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.CHAT_SEND);

    const { roomId, messageId } = await params;
    assertValidIds(roomId, messageId);
    await assertRoomAccess(roomId, verify.id);

    const socketId = req.headers.get("x-socket-id") ?? undefined;
    const { message: newText } = parseOrThrow(
      editMessageBodySchema,
      await req.json().catch(() => ({}))
    );

    const existing = await ChatMessage.findOne({
      _id: messageId,
      room: roomId,
    });
    if (!existing) throw ApiError.notFound("Message not found");
    if (!canModifyMessage(verify, existing)) throw ApiError.forbidden();

    existing.text = newText;
    existing.type = existing.type ?? CHAT_TYPE.USER;
    await existing.save();

    const payload = {
      id: String(existing._id),
      _id: String(existing._id),
      room: String(existing.room),
      sender: { id: verify.id, name: verify.user.name },
      type: existing.type,
      text: existing.text,
      readBy: existing.readBy ?? [],
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    };

    await pusherServer.trigger(
      `private-room-${roomId}`,
      "message:edit",
      payload,
      { socket_id: socketId },
    );

    return NextResponse.json(
      { status: "success", message: "Message updated", data: payload },
      { status: 200 },
    );
  } catch (error) {
    return errorToNextResponse(error, req.headers.get("x-request-id"));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string; messageId: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.CHAT_SEND);

    const { roomId, messageId } = await params;
    assertValidIds(roomId, messageId);
    await assertRoomAccess(roomId, verify.id);

    const socketId = req.headers.get("x-socket-id") ?? undefined;

    const existing = await ChatMessage.findOne({
      _id: messageId,
      room: roomId,
    });
    if (!existing) throw ApiError.notFound("Message not found");
    if (!canModifyMessage(verify, existing)) throw ApiError.forbidden();

    await ChatMessage.deleteOne({ _id: messageId });

    await pusherServer.trigger(
      `private-room-${roomId}`,
      "message:delete",
      { id: String(messageId) },
      { socket_id: socketId },
    );

    return NextResponse.json(
      {
        status: "success",
        message: "Message deleted",
        data: { id: String(messageId) },
      },
      { status: 200 },
    );
  } catch (error) {
    return errorToNextResponse(error, req.headers.get("x-request-id"));
  }
}
