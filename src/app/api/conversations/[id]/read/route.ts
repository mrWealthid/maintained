import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";

import Conversation from "@/models/conversationModel";
import {
  resolveConversationViewer,
  assertCanAccessConversation,
} from "@/lib/conversations/access";
import {
  markRepairConversationRead,
  repairConversationChannel,
  REPAIR_CONVERSATION_EVENTS,
} from "@/lib/conversations/conversation-service";
import { pusherServer } from "@/lib/pusher/server";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

/**
 * POST /api/conversations/[id]/read — advance the caller's read cursor to
 * "now" and broadcast a `read.update` event so the OTHER side can flip its
 * "delivered" indicators to "seen" in realtime.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connect();
    const viewer = await resolveConversationViewer();

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest("Invalid conversation id");
    }
    const conversation = await Conversation.findById(id);
    if (!conversation) throw ApiError.notFound("Conversation not found");
    assertCanAccessConversation(viewer, conversation);

    // viewer.role is narrowed to "manager" | "trade" by resolveConversationViewer.
    const at = await markRepairConversationRead({
      conversation,
      userId: viewer.userId,
      role: viewer.role,
    });

    try {
      await pusherServer.trigger(
        repairConversationChannel(conversation.id),
        REPAIR_CONVERSATION_EVENTS.READ_UPDATE,
        {
          conversation: conversation.id,
          userId: viewer.userId,
          role: viewer.role,
          lastReadAt: at,
        },
      );
    } catch (err) {
      console.error("[repair-conversation read] pusher trigger failed", err);
    }

    return NextResponse.json({ ok: true, data: { lastReadAt: at } });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
