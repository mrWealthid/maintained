import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { z } from "zod";

import Conversation from "@/models/conversationModel";
import ConversationMessage from "@/models/conversationMessageModel";
import RepairRequest from "@/models/repairRequestModel";
import Ticket from "@/models/ticketModel";
import Tradesperson from "@/models/tradespersonModel";

import {
  resolveConversationViewer,
} from "@/lib/conversations/access";
import { findOrCreateRepairConversation } from "@/lib/conversations/conversation-service";
import {
  CONVERSATION_SENDER_KIND,
} from "@/features/conversations/models/conversation-types.model";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

const CreateBodySchema = z.object({
  repairRequestId: z.string().min(1),
  /** Required when the caller is a manager initiating with a specific trade. */
  tradespersonId: z.string().optional(),
});

/**
 * POST /api/conversations
 *
 * Find or create the conversation for a `(repairRequest, trade)` pair.
 *   - Trade caller: trade is implicit (their own profile).
 *   - Manager caller: must provide `tradespersonId` and the trade must have
 *     a live quote on the request OR be on its `invitedTradespeople` list.
 */
export async function POST(request: NextRequest) {
  try {
    await connect();
    const viewer = await resolveConversationViewer();
    const body = parseOrThrow(CreateBodySchema, await request.json());

    if (!mongoose.isValidObjectId(body.repairRequestId)) {
      throw ApiError.badRequest("Invalid repairRequestId");
    }
    const repairRequest = await RepairRequest.findById(body.repairRequestId);
    if (!repairRequest) throw ApiError.notFound("Repair request not found");

    let tradespersonId: string;
    if (viewer.role === CONVERSATION_SENDER_KIND.TRADE) {
      tradespersonId = String(viewer.tradesperson._id);
      // Trade must be eligible: invited OR (broadcast + specialty match).
      const isInvited = repairRequest.invitedTradespeople
        .map((id) => id.toString())
        .includes(tradespersonId);
      const isBroadcastMatch =
        repairRequest.invitedTradespeople.length === 0 &&
        Boolean(repairRequest.specialty) &&
        (viewer.tradesperson.specialties ?? []).includes(
          repairRequest.specialty as never,
        );
      if (!isInvited && !isBroadcastMatch) {
        throw ApiError.forbidden("Not eligible to chat on this request");
      }
    } else {
      if (String(repairRequest.workspace) !== viewer.workspaceId) {
        throw ApiError.forbidden(
          "Repair request belongs to a different workspace",
        );
      }
      if (!body.tradespersonId || !mongoose.isValidObjectId(body.tradespersonId)) {
        throw ApiError.badRequest("Manager must provide tradespersonId");
      }
      tradespersonId = body.tradespersonId;
      // Sanity: the trade must exist.
      const trade = await Tradesperson.findById(tradespersonId).select("_id");
      if (!trade) throw ApiError.notFound("Tradesperson not found");
    }

    const conversation = await findOrCreateRepairConversation({
      workspace: repairRequest.workspace,
      ticket: repairRequest.ticket,
      repairRequest: repairRequest._id as never,
      tradesperson: tradespersonId,
    });

    return NextResponse.json({ ok: true, data: { conversation } });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}

/**
 * GET /api/conversations
 *
 * List conversations visible to the caller, newest activity first. The
 * response is intentionally lean — it powers the inbox list, not the
 * thread view.
 */
export async function GET(request: NextRequest) {
  try {
    await connect();
    const viewer = await resolveConversationViewer();

    const filter =
      viewer.role === CONVERSATION_SENDER_KIND.TRADE
        ? { tradesperson: viewer.tradesperson._id }
        : { workspace: viewer.workspaceId };

    const conversations = await Conversation.find(filter)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(100)
      .lean<
        Array<{
          _id: unknown;
          workspace: unknown;
          ticket: unknown;
          repairRequest: unknown;
          tradesperson: unknown;
          lastMessageAt?: Date;
          lastMessagePreview?: string;
          participantReads?: Array<{
            user: unknown;
            role: string;
            lastReadAt: Date;
          }>;
        }>
      >();

    // Enrich with the ticket title + trade business name so the inbox row
    // can render in one render without N joins.
    const ticketIds = Array.from(
      new Set(conversations.map((c) => String(c.ticket))),
    );
    const tradeIds = Array.from(
      new Set(conversations.map((c) => String(c.tradesperson))),
    );
    const [tickets, trades] = await Promise.all([
      ticketIds.length
        ? Ticket.find({ _id: { $in: ticketIds } })
            .select("title slug")
            .lean<Array<{ _id: unknown; title?: string; slug?: string }>>()
        : Promise.resolve([]),
      tradeIds.length
        ? Tradesperson.find({ _id: { $in: tradeIds } })
            .select("businessName slug")
            .lean<Array<{ _id: unknown; businessName?: string; slug?: string }>>()
        : Promise.resolve([]),
    ]);
    const ticketById = new Map(tickets.map((t) => [String(t._id), t]));
    const tradeById = new Map(trades.map((t) => [String(t._id), t]));

    // Unread count per conversation (messages newer than my own cursor +
    // posted by the OTHER side). We could push this into an $expr aggregate
    // but the list is capped at 100 — a single follow-up query is fine.
    const cursorByConv = new Map<string, Date>();
    for (const c of conversations) {
      const mine = c.participantReads?.find(
        (p) => String(p.user) === viewer.userId,
      );
      cursorByConv.set(String(c._id), mine?.lastReadAt ?? new Date(0));
    }
    const oppositeKind =
      viewer.role === CONVERSATION_SENDER_KIND.TRADE
        ? CONVERSATION_SENDER_KIND.MANAGER
        : CONVERSATION_SENDER_KIND.TRADE;
    const unreadAgg = conversations.length
      ? await ConversationMessage.aggregate([
          {
            $match: {
              conversation: {
                $in: conversations.map((c) => c._id),
              },
              senderKind: { $in: [oppositeKind, CONVERSATION_SENDER_KIND.SYSTEM] },
            },
          },
          {
            $group: {
              _id: "$conversation",
              latestAt: { $max: "$createdAt" },
              messages: {
                $push: { createdAt: "$createdAt" },
              },
            },
          },
        ])
      : [];

    const unreadCountById = new Map<string, number>();
    for (const row of unreadAgg as Array<{
      _id: unknown;
      messages: Array<{ createdAt: Date }>;
    }>) {
      const cursor = cursorByConv.get(String(row._id)) ?? new Date(0);
      const count = row.messages.filter(
        (m) => m.createdAt.getTime() > cursor.getTime(),
      ).length;
      unreadCountById.set(String(row._id), count);
    }

    return NextResponse.json({
      ok: true,
      data: conversations.map((c) => ({
        ...c,
        ticket: ticketById.get(String(c.ticket)) ?? null,
        tradesperson: tradeById.get(String(c.tradesperson)) ?? null,
        unreadCount: unreadCountById.get(String(c._id)) ?? 0,
      })),
      meta: {
        scope: viewer.role,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}

