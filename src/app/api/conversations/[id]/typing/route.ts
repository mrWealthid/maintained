import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";

import Conversation from "@/models/conversationModel";
import {
  resolveConversationViewer,
  assertCanAccessConversation,
} from "@/lib/conversations/access";
import {
  repairConversationChannel,
  REPAIR_CONVERSATION_EVENTS,
} from "@/lib/conversations/conversation-service";
import { pusherServer } from "@/lib/pusher/server";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

const BodySchema = z.object({
  active: z.boolean(),
});

/**
 * POST /api/conversations/[id]/typing
 *
 * Relay-only endpoint: it doesn't persist anything, just fires a Pusher
 * `typing.update` event with the caller's role + a freshness timestamp so
 * the other side can render a transient "X is typing…" indicator.
 *
 * The client is responsible for debouncing — keystrokes shouldn't post on
 * every change. A reasonable client pattern is: fire `active: true` after
 * the first keystroke, then a single `active: false` 3 seconds after the
 * last keystroke (idle).
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
    const conversation = await Conversation.findById(id).select(
      "_id workspace tradesperson",
    );
    if (!conversation) throw ApiError.notFound("Conversation not found");
    assertCanAccessConversation(viewer, conversation);

    const payload = parseOrThrow(BodySchema, await request.json());

    try {
      await pusherServer.trigger(
        repairConversationChannel(conversation.id),
        REPAIR_CONVERSATION_EVENTS.TYPING_UPDATE,
        {
          conversation: conversation.id,
          userId: viewer.userId,
          role: viewer.role,
          active: payload.active,
          at: new Date().toISOString(),
        },
      );
    } catch (err) {
      console.error("[typing] pusher trigger failed", err);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
