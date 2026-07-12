import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { resolveTicketIdentifier } from "@/lib/tickets/resolve-ticket-identifier";

import Ticket from "@/models/ticketModel";
import RepairRequest from "@/models/repairRequestModel";
import RepairQuote from "@/models/repairQuoteModel";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

/**
 * GET /api/tickets/[slug]/repair-quotes
 *
 * Admin-side: all quotes across every RepairRequest for a ticket, newest
 * first, enriched with a small slice of the submitting Tradesperson.
 * Used by the comparison panel on the ticket detail.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await connect();

    const { slug } = await params;
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    if (verify.isUserRole || verify.isTechnicianRole) throw ApiError.forbidden();

    await assertLegacyWorkspacePermission(
      verify,
      PERMISSION.TECHNICIAN_REQUESTS_VIEW,
    );

    const ticketId = await resolveTicketIdentifier(slug);
    const ticket = await Ticket.findById(ticketId).select("business");
    if (!ticket) throw ApiError.notFound("Ticket not found");
    if (String(ticket.business) !== String(verify.currentBusiness)) {
      throw ApiError.forbidden("Ticket belongs to a different workspace");
    }

    const repairRequests = await RepairRequest.find({ ticket: ticketId })
      .select("_id status specialty createdAt")
      .lean();
    const requestIds = repairRequests.map((r) => r._id);
    if (requestIds.length === 0) {
      return NextResponse.json({
        ok: true,
        data: { repairRequests: [], quotes: [] },
      });
    }

    const quotes = await RepairQuote.find({
      repairRequest: { $in: requestIds },
    })
      .sort({ submittedAt: -1 })
      .populate({
        path: "tradesperson",
        select: "businessName slug specialties",
      })
      .lean();

    return NextResponse.json({
      ok: true,
      data: {
        repairRequests,
        quotes,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
