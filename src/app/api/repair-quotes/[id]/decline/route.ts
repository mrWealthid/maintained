import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

import RepairQuote from "@/models/repairQuoteModel";
import RepairRequest from "@/models/repairRequestModel";
import { TicketActivity } from "@/models/ticketActivity";
import User from "@/models/userModel";
import { REPAIR_QUOTE_STATUS } from "@/features/repair-quotes/models/repair-quote-status.model";
import { emitQuoteDeclinedMessage } from "@/lib/conversations/quote-events";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

/**
 * POST /api/repair-quotes/[id]/decline — admin declines a single quote.
 * Leaves the RepairRequest open so other trades can still win it. Use
 * `/accept` on the chosen quote (which auto-declines siblings) when the
 * decision is final.
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
        `Cannot decline a quote with status: ${quote.status}`,
      );
    }

    const repairRequest = await RepairRequest.findById(quote.repairRequest);
    if (!repairRequest) throw ApiError.notFound("Repair request not found");
    if (String(repairRequest.workspace) !== String(verify.currentBusiness)) {
      throw ApiError.forbidden("Quote belongs to a different workspace");
    }

    quote.status = REPAIR_QUOTE_STATUS.DECLINED;
    quote.decidedAt = new Date();
    await quote.save();

    try {
      await emitQuoteDeclinedMessage({ repairRequest, quote });
    } catch (err) {
      console.error("[repair-quote decline] emit failed", err);
    }

    await TicketActivity.create({
      ticket: repairRequest.ticket,
      action: "status-changed",
      description: `Quote declined by ${adminUser.name}`,
      changedBy: adminUser._id,
      metadata: {
        repairQuoteId: quote.id,
      },
    });

    return NextResponse.json({ ok: true, data: { quote } });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
