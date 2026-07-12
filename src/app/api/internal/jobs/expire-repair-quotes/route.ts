import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import RepairQuote from "@/models/repairQuoteModel";
import { REPAIR_QUOTE_STATUS } from "@/features/repair-quotes/models/repair-quote-status.model";

/**
 * POST /api/internal/jobs/expire-repair-quotes
 *
 * Background sweep that flips `submitted` quotes whose `expiresAt` has
 * passed to `expired`. Idempotent — running it twice in the same minute is
 * a no-op the second time.
 *
 * Auth: same `Authorization: Bearer <N8N_WEBHOOK_SECRET>` pattern as the
 * existing AI-triage webhook so the user can wire it to n8n or any
 * external scheduler without inventing a new auth mode.
 *
 * Wire it to a cron in n8n (every 5 minutes is fine) or any external
 * scheduler; the response body is JSON-friendly for log aggregation.
 */
function assertInternalSecret(request: NextRequest) {
  const secret =
    process.env.N8N_WEBHOOK_SECRET ?? process.env.INTERNAL_API_SECRET;
  if (!secret) {
    throw ApiError.unavailable("Internal webhook secret is not configured");
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    throw ApiError.unauthorized("Invalid internal webhook token");
  }
}

export async function POST(request: NextRequest) {
  try {
    assertInternalSecret(request);
    await connect();
    const now = new Date();
    const result = await RepairQuote.updateMany(
      {
        status: REPAIR_QUOTE_STATUS.SUBMITTED,
        expiresAt: { $lte: now },
      },
      {
        $set: {
          status: REPAIR_QUOTE_STATUS.EXPIRED,
          decidedAt: now,
        },
      },
    );
    return NextResponse.json({
      ok: true,
      data: {
        expiredCount: result.modifiedCount,
        scannedAt: now,
      },
    });
  } catch (error) {
    return errorToNextResponse(
      error,
      request.headers.get("x-request-id") ?? undefined,
    );
  }
}
