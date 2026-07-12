import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import {
  getVerifiedUserState,
  VERIFIED_USER_STATE_STATUS,
} from "@/lib/auth/getVerifiedUser";
import { ACCOUNT_KIND } from "@/shared/enums/account-kind";

import User from "@/models/userModel";
import Tradesperson from "@/models/tradespersonModel";
import RepairRequest from "@/models/repairRequestModel";
import RepairQuote from "@/models/repairQuoteModel";

import { REPAIR_REQUEST_STATUS } from "@/features/repair-requests/models/repair-request-status.model";
import {
  REPAIR_QUOTE_STATUS,
  REPAIR_QUOTE_LIVE_STATUSES,
} from "@/features/repair-quotes/models/repair-quote-status.model";
import { RepairQuoteSubmitSchema } from "@/features/repair-quotes/models/repair-quote.schema";
import {
  emitQuoteRevisedMessage,
  emitQuoteSubmittedMessage,
} from "@/lib/conversations/quote-events";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

/**
 * POST /api/trades/me/quotes
 *
 * Submit a quote against an open `RepairRequest`. If the calling trade
 * already has a live quote on this request, the prior quote is flipped to
 * `revised` and the new one's `parentQuote` points back at it (revision
 * chain). The partial unique index on (repairRequest, tradesperson) only
 * applies to `submitted | accepted` so the chain can grow indefinitely.
 *
 * Eligibility:
 *   - Trade is in `request.invitedTradespeople`, OR
 *   - `request.invitedTradespeople` is empty AND `request.specialty` is
 *     one of the trade's `specialties`.
 *
 * Stripe Connect is intentionally out of scope; the amount is informational
 * — settlement happens off-platform.
 */
export async function POST(request: NextRequest) {
  try {
    await connect();

    const state = await getVerifiedUserState();
    if (state.status !== VERIFIED_USER_STATE_STATUS.AUTHORIZED) {
      throw ApiError.unauthorized();
    }
    const user = await User.findById(state.user.id)
      .select("accountKind")
      .lean<{ accountKind?: string }>();
    if (user?.accountKind !== ACCOUNT_KIND.TRADE) {
      throw ApiError.forbidden("Trade account required");
    }

    const trade = await Tradesperson.findOne({ userId: state.user.id })
      .select("_id specialties isActive");
    if (!trade) throw ApiError.forbidden("Trade profile required");
    if (!trade.isActive) {
      throw ApiError.forbidden("Trade profile is not active");
    }

    const payload = parseOrThrow(
      RepairQuoteSubmitSchema,
      await request.json(),
    );

    if (!mongoose.isValidObjectId(payload.repairRequestId)) {
      throw ApiError.badRequest("Invalid repairRequestId");
    }

    const repairRequest = await RepairRequest.findById(
      payload.repairRequestId,
    );
    if (!repairRequest) throw ApiError.notFound("Repair request not found");
    if (repairRequest.status !== REPAIR_REQUEST_STATUS.OPEN) {
      throw ApiError.conflict("Repair request is no longer open");
    }
    if (
      repairRequest.expiresAt &&
      repairRequest.expiresAt.getTime() < Date.now()
    ) {
      throw ApiError.conflict("Repair request has expired");
    }

    const isInvited = repairRequest.invitedTradespeople
      .map((id) => id.toString())
      .includes(trade.id);
    const isBroadcastMatch =
      repairRequest.invitedTradespeople.length === 0 &&
      Boolean(repairRequest.specialty) &&
      (trade.specialties ?? []).includes(repairRequest.specialty as never);

    if (!isInvited && !isBroadcastMatch) {
      throw ApiError.forbidden(
        "This request is not open to you (specialty mismatch or not invited).",
      );
    }

    // Supersede any live prior quote from this trade — single revision chain.
    const prior = await RepairQuote.findOne({
      repairRequest: repairRequest._id,
      tradesperson: trade._id,
      status: { $in: REPAIR_QUOTE_LIVE_STATUSES },
    });

    if (prior) {
      prior.status = REPAIR_QUOTE_STATUS.REVISED;
      prior.decidedAt = new Date();
      await prior.save();
    }

    const created = await RepairQuote.create({
      repairRequest: repairRequest._id,
      tradesperson: trade._id,
      amountCents: payload.amountCents ?? 0, // pre-save hook recomputes if line items present
      currency: payload.currency,
      lineItems: payload.lineItems,
      scheduleProposal: payload.scheduleProposal
        ? {
            earliestStart: payload.scheduleProposal.earliestStart
              ? new Date(payload.scheduleProposal.earliestStart)
              : undefined,
            durationHours: payload.scheduleProposal.durationHours,
          }
        : undefined,
      terms: payload.terms,
      warrantyDays: payload.warrantyDays,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
      status: REPAIR_QUOTE_STATUS.SUBMITTED,
      parentQuote: prior?._id,
    });

    // Fire the quote-event system message. Failures should NOT break the
    // submit — the quote is already persisted. We log and move on.
    try {
      if (prior) {
        await emitQuoteRevisedMessage({
          repairRequest,
          quote: created,
          previousAmountCents: prior.amountCents,
        });
      } else {
        await emitQuoteSubmittedMessage({ repairRequest, quote: created });
      }
    } catch (err) {
      console.error("[trade quotes POST] quote-event emit failed", err);
    }

    return NextResponse.json({
      ok: true,
      data: {
        quote: created,
        isRevision: Boolean(prior),
      },
    });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}

/**
 * GET /api/trades/me/quotes — list quotes the calling trade has submitted,
 * newest first. Used by the trade's `/trades/quotes` list.
 */
export async function GET(request: NextRequest) {
  try {
    await connect();

    const state = await getVerifiedUserState();
    if (state.status !== VERIFIED_USER_STATE_STATUS.AUTHORIZED) {
      throw ApiError.unauthorized();
    }
    const user = await User.findById(state.user.id)
      .select("accountKind")
      .lean<{ accountKind?: string }>();
    if (user?.accountKind !== ACCOUNT_KIND.TRADE) {
      throw ApiError.forbidden("Trade account required");
    }
    const trade = await Tradesperson.findOne({ userId: state.user.id })
      .select("_id");
    if (!trade) throw ApiError.forbidden("Trade profile required");

    const quotes = await RepairQuote.find({ tradesperson: trade._id })
      .sort({ submittedAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ ok: true, data: quotes });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
