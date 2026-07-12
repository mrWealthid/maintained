import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import {
  getVerifiedUserState,
  VERIFIED_USER_STATE_STATUS,
} from "@/lib/auth/getVerifiedUser";
import { ACCOUNT_KIND } from "@/shared/enums/account-kind";

import User from "@/models/userModel";
import Tradesperson from "@/models/tradespersonModel";
import RepairQuote from "@/models/repairQuoteModel";
import RepairRequest from "@/models/repairRequestModel";
import { REPAIR_QUOTE_STATUS } from "@/features/repair-quotes/models/repair-quote-status.model";
import { emitQuoteWithdrawnMessage } from "@/lib/conversations/quote-events";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

/**
 * POST /api/trades/me/quotes/[id]/withdraw — trade withdraws a live quote.
 * Only allowed while the quote is `submitted`. Once accepted the trade can
 * no longer back out unilaterally (that's a workspace decision).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest("Invalid quote id");
    }

    const quote = await RepairQuote.findById(id);
    if (!quote) throw ApiError.notFound("Quote not found");
    if (String(quote.tradesperson) !== trade.id) {
      throw ApiError.forbidden("Cannot withdraw another trade's quote");
    }
    if (quote.status !== REPAIR_QUOTE_STATUS.SUBMITTED) {
      throw ApiError.conflict(
        `Cannot withdraw a quote with status: ${quote.status}`,
      );
    }

    quote.status = REPAIR_QUOTE_STATUS.WITHDRAWN;
    quote.decidedAt = new Date();
    await quote.save();

    try {
      const repairRequest = await RepairRequest.findById(quote.repairRequest);
      if (repairRequest) {
        await emitQuoteWithdrawnMessage({ repairRequest, quote });
      }
    } catch (err) {
      console.error("[trade quote withdraw] emit failed", err);
    }

    return NextResponse.json({ ok: true, data: { quote } });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
