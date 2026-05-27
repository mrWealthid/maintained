import { NextRequest, NextResponse } from "next/server";

import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { resolveTicketIdentifier } from "@/lib/tickets/resolve-ticket-identifier";
import {
  MAX_RETRIAGE_ATTEMPTS,
  hasReTriageAttemptsLeft,
  isTriageInFlight,
  runReTriage,
} from "@/lib/tickets/retriage";
import Ticket from "@/models/ticketModel";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    if (verify.isUserRole) throw ApiError.forbidden();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_EDIT);

    const ticketId = await resolveTicketIdentifier(slug);
    const ticket = await Ticket.findOne({
      _id: ticketId,
      business: verify.currentBusiness,
    });
    if (!ticket) throw ApiError.notFound("Ticket not found");

    if (isTriageInFlight(ticket.aiTriageStatus)) {
      throw ApiError.conflict("AI triage is already running for this ticket");
    }
    if (!hasReTriageAttemptsLeft(ticket.aiTriageRetryCount)) {
      throw ApiError.conflict(
        `Maximum re-triage attempts (${MAX_RETRIAGE_ATTEMPTS}) reached for this ticket`,
      );
    }

    const result = await runReTriage(ticket);
    if (!result.sent && "error" in result) {
      throw ApiError.unavailable(
        "Triage service is unavailable. Please try again shortly.",
      );
    }

    return NextResponse.json({
      message: "AI triage re-queued",
      success: true,
      data: ticket,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
