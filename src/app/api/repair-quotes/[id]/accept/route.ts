import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

import RepairQuote from "@/models/repairQuoteModel";
import RepairRequest from "@/models/repairRequestModel";
import Tradesperson from "@/models/tradespersonModel";
import Ticket from "@/models/ticketModel";
import User from "@/models/userModel";
import { TicketActivity } from "@/models/ticketActivity";

import { REPAIR_QUOTE_STATUS } from "@/features/repair-quotes/models/repair-quote-status.model";
import { REPAIR_REQUEST_STATUS } from "@/features/repair-requests/models/repair-request-status.model";
import { TICKET_STATUS } from "@/shared/enums/enums";
import {
  emitQuoteAcceptedMessage,
  emitQuoteDeclinedMessage,
} from "@/lib/conversations/quote-events";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

/**
 * POST /api/repair-quotes/[id]/accept
 *
 * Admin accepts a quote. Atomic transaction:
 *   1. Quote status → accepted, decidedAt now.
 *   2. RepairRequest → closed.
 *   3. All sibling `submitted` quotes on the same request → declined.
 *   4. Ticket.assignedTo → quote's tradesperson user; ticket.status → assigned.
 *
 * Reuses `TECHNICIAN_REQUESTS_MANAGE` so admins don't need a parallel perm
 * set. Per-request `Conversation` setup for execution chat lands in Phase 4
 * (the existing per-ticket ChatRoom is not auto-created here).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connect();

    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    if (verify.isUserRole || verify.isTechnicianRole) throw ApiError.forbidden();
    await assertLegacyWorkspacePermission(
      verify,
      PERMISSION.TECHNICIAN_REQUESTS_MANAGE,
    );

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest("Invalid quote id");
    }

    const adminUser = await User.findById(verify.id);
    if (!adminUser) throw ApiError.notFound("Admin user not found");

    const quote = await RepairQuote.findById(id);
    if (!quote) throw ApiError.notFound("Quote not found");
    if (quote.status !== REPAIR_QUOTE_STATUS.SUBMITTED) {
      throw ApiError.conflict(
        `Cannot accept a quote with status: ${quote.status}`,
      );
    }

    const repairRequest = await RepairRequest.findById(quote.repairRequest);
    if (!repairRequest) throw ApiError.notFound("Repair request not found");
    if (repairRequest.status !== REPAIR_REQUEST_STATUS.OPEN) {
      throw ApiError.conflict("Repair request is no longer open");
    }
    if (String(repairRequest.workspace) !== String(verify.currentBusiness)) {
      throw ApiError.forbidden("Repair request belongs to a different workspace");
    }

    const ticket = await Ticket.findById(repairRequest.ticket);
    if (!ticket) throw ApiError.notFound("Ticket not found");

    const trade = await Tradesperson.findById(quote.tradesperson)
      .select("_id userId businessName");
    if (!trade) throw ApiError.notFound("Tradesperson not found");

    // Snapshot the sibling quote ids before the transaction so we can fire
    // their `quote_declined` system messages after commit.
    const siblingQuotes = await RepairQuote.find({
      repairRequest: repairRequest._id,
      _id: { $ne: quote._id },
      status: REPAIR_QUOTE_STATUS.SUBMITTED,
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    let committed = false;
    try {
      const now = new Date();

      // 1. Accept the chosen quote.
      quote.status = REPAIR_QUOTE_STATUS.ACCEPTED;
      quote.decidedAt = now;
      await quote.save({ session });

      // 2. Close the broadcast.
      repairRequest.status = REPAIR_REQUEST_STATUS.CLOSED;
      repairRequest.closedAt = now;
      await repairRequest.save({ session });

      // 3. Auto-decline sibling submitted quotes.
      await RepairQuote.updateMany(
        {
          repairRequest: repairRequest._id,
          _id: { $ne: quote._id },
          status: REPAIR_QUOTE_STATUS.SUBMITTED,
        },
        {
          $set: {
            status: REPAIR_QUOTE_STATUS.DECLINED,
            decidedAt: now,
          },
        },
        { session },
      );

      // 4. Assign the ticket to the winning trade's user.
      const previousStatus = ticket.status;
      const previousAssigned = ticket.assignedTo;
      ticket.assignedTo = trade.userId as never;
      ticket.actionedBy = adminUser._id as never;
      ticket.status = TICKET_STATUS.assigned;
      await ticket.save({ session });

      await TicketActivity.create(
        [
          {
            ticket: ticket._id,
            action: "status-changed",
            description: `Quote accepted from ${trade.businessName} by ${adminUser.name}`,
            changedBy: adminUser._id,
            metadata: {
              repairRequestId: repairRequest.id,
              repairQuoteId: quote.id,
              tradeId: trade.id,
              status: {
                previous: previousStatus,
                current: ticket.status,
              },
              assignedTo: {
                previous: previousAssigned,
                current: ticket.assignedTo,
              },
            },
          },
        ],
        { session },
      );

      await session.commitTransaction();
      committed = true;
    } catch (err) {
      if (!committed && session.inTransaction()) {
        await session.abortTransaction();
      }
      throw err;
    } finally {
      session.endSession();
    }

    // Post-commit: fire system messages. We do this AFTER commit so a chat
    // failure can never roll back the acceptance. Best-effort; logged.
    try {
      await emitQuoteAcceptedMessage({ repairRequest, quote });
      for (const sibling of siblingQuotes) {
        sibling.status = REPAIR_QUOTE_STATUS.DECLINED;
        await emitQuoteDeclinedMessage({ repairRequest, quote: sibling });
      }
    } catch (err) {
      console.error("[repair-quote accept] system message emit failed", err);
    }

    return NextResponse.json({
      ok: true,
      data: {
        quote,
        repairRequest,
        ticket: {
          id: ticket.id,
          slug: ticket.slug,
          status: ticket.status,
          assignedTo: ticket.assignedTo,
        },
      },
    });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
