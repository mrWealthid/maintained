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
import ConversationMessage from "@/models/conversationMessageModel";
import {
  resolveConversationViewer,
  assertCanAccessConversation,
} from "@/lib/conversations/access";
import { postRepairConversationMessage } from "@/lib/conversations/conversation-service";
import { CONVERSATION_MESSAGE_TYPE } from "@/features/conversations/models/conversation-types.model";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

const PostBodySchema = z.object({
  body: z.string().trim().min(1, "Message body is required").max(4000),
});

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 200;

/**
 * GET /api/conversations/[id]/messages
 *
 * Cursor-paginated thread, returned oldest-first within the page so the UI
 * can append/prepend without re-sorting.
 *
 *   - No params       → most recent `DEFAULT_PAGE_SIZE` messages.
 *   - `?before=<ISO>` → page of messages strictly older than that
 *                       createdAt. Use the OLDEST createdAt currently in
 *                       view as the cursor for "Load earlier".
 *   - `?limit=N`      → cap (1..MAX_PAGE_SIZE).
 *
 * The response includes `hasMore` so the client knows whether to render
 * the "Load earlier" affordance.
 */
export async function GET(
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

    const beforeRaw = request.nextUrl.searchParams.get("before");
    const limitRaw = request.nextUrl.searchParams.get("limit");
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(limitRaw) || DEFAULT_PAGE_SIZE),
    );

    const filter: Record<string, unknown> = { conversation: conversation._id };
    if (beforeRaw) {
      const before = new Date(beforeRaw);
      if (Number.isNaN(before.getTime())) {
        throw ApiError.badRequest("Invalid `before` timestamp");
      }
      filter.createdAt = { $lt: before };
    }

    // Fetch the newest `limit` (descending), then reverse so the array is
    // oldest-first for client consumption.
    const recentDesc = await ConversationMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = recentDesc.length > limit;
    const messages = recentDesc.slice(0, limit).reverse();

    return NextResponse.json({
      ok: true,
      data: {
        conversation,
        messages,
        hasMore,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}

/**
 * POST /api/conversations/[id]/messages — send a text message. System
 * messages can only be created by the server (Phase 4c quote-event hooks);
 * the API only accepts type=text from clients.
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

    const payload = parseOrThrow(PostBodySchema, await request.json());

    const message = await postRepairConversationMessage({
      conversation,
      senderUser: viewer.userId,
      senderKind: viewer.role,
      type: CONVERSATION_MESSAGE_TYPE.TEXT,
      body: payload.body,
    });

    return NextResponse.json({ ok: true, data: { message } });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
