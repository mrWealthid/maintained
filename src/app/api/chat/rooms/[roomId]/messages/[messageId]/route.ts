// src/app/api/rooms/[roomId]/messages/[messageId]/route.ts
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { pusherServer } from "@/lib/pusher/pusher";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";

import ChatMessage from "@/models/chatMessage";
import { assertRoomAccess } from "@/lib/chat/chatAuth";
import { CHAT_TYPE } from "@/features/chat-feat/data/enums";

// If your Pusher server SDK needs Node:
export const runtime = "nodejs";

// --- helpers ---
function isValidObjectId(id?: string) {
  return !!id && Types.ObjectId.isValid(id);
}

function canModifyMessage(verify: any, message: any) {
  // Adjust these property names to your auth model
  const isSender = String(message.sender) === String(verify.id);
  const isAdmin = !!verify.isAdminRole || !!verify.isSuperAdminRole;
  return isSender || isAdmin;
}

// =================== PATCH (Edit message text) ===================
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roomId: string; messageId: string }> }
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { roomId, messageId } = await params;

    if (!isValidObjectId(roomId) || !isValidObjectId(messageId)) {
      return NextResponse.json({ error: "Invalid id(s)" }, { status: 400 });
    }

    await assertRoomAccess(roomId, verify.id);

    const socketId = req.headers.get("x-socket-id") ?? undefined;
    const body = await req.json().catch(() => ({}));
    const newText: string | undefined = body?.message;

    if (!newText || !newText.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // Load message to check ownership/permissions
    const existing = await ChatMessage.findOne({
      _id: messageId,
      room: roomId,
    });
    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (!canModifyMessage(verify, existing)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    existing.text = newText.trim();
    existing.type = existing.type ?? CHAT_TYPE.USER; // keep or set a default
    await existing.save();

    console.log(existing);

    // Shape a light payload for clients (matches your ChatRoomMessage-ish shape)
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
      { socket_id: socketId }
    );

    return NextResponse.json(
      { status: "success", message: "Message updated", data: payload },
      { status: 200 }
    );
  } catch (e) {
    console.error("PATCH message error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// =================== DELETE (Remove message) ===================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roomId: string; messageId: string }> }
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { roomId, messageId } = await params;

    if (!isValidObjectId(roomId) || !isValidObjectId(messageId)) {
      return NextResponse.json({ error: "Invalid id(s)" }, { status: 400 });
    }

    await assertRoomAccess(roomId, verify.id);

    const socketId = req.headers.get("x-socket-id") ?? undefined;

    const existing = await ChatMessage.findOne({
      _id: messageId,
      room: roomId,
    });
    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (!canModifyMessage(verify, existing)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ChatMessage.deleteOne({ _id: messageId });

    // Minimal delete payload—your client expects `{ id }`
    await pusherServer.trigger(
      `private-room-${roomId}`,
      "message:delete",
      { id: String(messageId) },
      { socket_id: socketId }
    );

    return NextResponse.json(
      {
        status: "success",
        message: "Message deleted",
        data: { id: String(messageId) },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("DELETE message error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
