import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { resolveTicketIdentifier } from "@/lib/tickets/resolve-ticket-identifier";

import Ticket from "@/models/ticketModel";
import RepairRequest from "@/models/repairRequestModel";
import Tradesperson from "@/models/tradespersonModel";
import WorkspaceTrade from "@/models/workspaceTradeModel";
import User from "@/models/userModel";
import Business from "@/models/businessModel";
import { TicketActivity } from "@/models/ticketActivity";
import { TICKET_STATUS } from "@/shared/enums/enums";
import { WORKSPACE_TRADE_STATUS } from "@/features/trades/models/trade-status.model";
import { sendTradeSystemEmail } from "@/lib/email/clients/trade-system-email.client";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";

import { RepairRequestBroadcastSchema } from "@/features/repair-requests/models/repair-request.schema";
import {
  REPAIR_REQUEST_STATUS,
  type RepairRequestStatus,
} from "@/features/repair-requests/models/repair-request-status.model";

const getRequestId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

/**
 * Broadcast a ticket as a `RepairRequest` to one or more tradespeople.
 *
 * Modelled on eventSphere's POST /api/events/[id]/service-requests:
 *   - Empty `invitedTradespeopleSlugs` + a `specialty` → open broadcast.
 *     Any active Tradesperson whose specialties include that one will see
 *     it in their inbox.
 *   - Non-empty `invitedTradespeopleSlugs` → shortlist. Only those trades
 *     see it, regardless of specialty.
 *
 * Snapshots `ticket.aiTriage.technicianDiagnosis` onto the request so a
 * later re-triage doesn't silently change what the trades saw when they
 * quoted. Reuses the existing `TECHNICIAN_REQUESTS_CREATE` permission so
 * admins don't have to manage a parallel set of perms during the rollout.
 *
 * Email fan-out and WorkspaceTrade scoping are deferred — see
 * TRADESPEOPLE_REWORK.md.
 */
export async function POST(
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
      PERMISSION.TECHNICIAN_REQUESTS_CREATE,
    );

    const adminUser = await User.findById(verify.id);
    if (!adminUser) throw ApiError.notFound("Admin user not found");

    const payload = parseOrThrow(
      RepairRequestBroadcastSchema,
      await request.json(),
    );

    const ticketId = await resolveTicketIdentifier(slug);
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw ApiError.notFound("Ticket not found");
    if (String(ticket.business) !== String(verify.currentBusiness)) {
      throw ApiError.forbidden("Ticket belongs to a different workspace");
    }

    // Resolve shortlist slugs → Tradesperson ids. Every slug must be a
    // tradesperson actively linked to THIS workspace via WorkspaceTrade —
    // workspaces can't broadcast to trades they haven't added.
    let invitedIds: string[] = [];
    if (payload.invitedTradespeopleSlugs.length > 0) {
      const trades = await Tradesperson.find({
        slug: { $in: payload.invitedTradespeopleSlugs },
        isActive: true,
      })
        .select("_id slug")
        .lean<{ _id: unknown; slug: string }[]>();

      const foundSlugs = new Set(trades.map((t) => t.slug));
      const missing = payload.invitedTradespeopleSlugs.filter(
        (s) => !foundSlugs.has(s),
      );
      if (missing.length) {
        throw ApiError.badRequest(
          `Unknown tradesperson slugs: ${missing.join(", ")}`,
        );
      }

      const activeLinks = await WorkspaceTrade.find({
        workspace: ticket.business,
        tradesperson: { $in: trades.map((t) => t._id) },
        status: WORKSPACE_TRADE_STATUS.ACTIVE,
      })
        .select("tradesperson")
        .lean<{ tradesperson: unknown }[]>();
      const linkedIds = new Set(activeLinks.map((l) => String(l.tradesperson)));
      const unlinked = trades.filter((t) => !linkedIds.has(String(t._id)));
      if (unlinked.length) {
        throw ApiError.badRequest(
          `These trades aren't linked to your workspace yet: ${unlinked
            .map((t) => t.slug)
            .join(", ")}. Invite them first.`,
        );
      }
      invitedIds = trades.map((t) => String(t._id));
    }

    // Snapshot diagnosis so re-triage can't mutate what recipients saw.
    // Admin can opt out per-broadcast via `includeDiagnosis: false`.
    const diag = ticket.aiTriage?.technicianDiagnosis;
    const technicianDiagnosis =
      payload.includeDiagnosis && diag
        ? {
            probableIssue: diag.probableIssue,
            inspectionPoints: diag.inspectionPoints ?? [],
            recommendedTools: diag.recommendedTools ?? [],
            safetyNotes: diag.safetyNotes ?? [],
          }
        : undefined;

    const created = await RepairRequest.create({
      ticket: ticketId,
      workspace: ticket.business,
      createdBy: adminUser._id,
      specialty: payload.specialty,
      invitedTradespeople: invitedIds,
      scopeNotes: payload.scopeNotes,
      technicianDiagnosis,
      status: REPAIR_REQUEST_STATUS.OPEN satisfies RepairRequestStatus,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
    });

    // Advance ticket to pending_assignment so dashboards reflect the broadcast,
    // but only if the ticket hasn't already been assigned past it.
    const previousStatus = ticket.status;
    const advanceable: string[] = [
      TICKET_STATUS.pending,
      TICKET_STATUS.processing,
    ];
    if (advanceable.includes(ticket.status)) {
      ticket.status = TICKET_STATUS.pending_assignment;
      ticket.actionedBy = adminUser._id as never;
      await ticket.save();
    }

    await TicketActivity.create({
      ticket: ticketId,
      action: "status-changed",
      description: `Repair request broadcast by ${adminUser.name}`,
      changedBy: adminUser._id,
      metadata: {
        repairRequestId: created.id,
        specialty: payload.specialty,
        invitedTradespeopleSlugs: payload.invitedTradespeopleSlugs,
        includeDiagnosis: payload.includeDiagnosis,
        diagnosisAttached: Boolean(technicianDiagnosis),
        status: {
          previous: previousStatus,
          current: ticket.status,
        },
      },
    });

    // Resolve who actually gets this broadcast, then email them.
    // Discovery rule is the SAME as the trade inbox query:
    //   shortlist → exactly those invited trades
    //   open broadcast → trades actively linked to this workspace whose
    //                    specialties include the requested one.
    void fanOutBroadcastEmails({
      requestUrl: resolveAppBaseUrl(request),
      ticketSlug: ticket.slug,
      ticketTitle: ticket.title,
      workspaceId: String(ticket.business),
      specialty: payload.specialty,
      invitedTradespersonIds: invitedIds,
      diagnosis: created.technicianDiagnosis,
    }).catch((err) =>
      console.error("[tickets broadcast] email fan-out failed", err),
    );

    return NextResponse.json({
      ok: true,
      data: {
        repairRequest: created,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

type FanOutInput = {
  requestUrl: string;
  ticketSlug: string;
  ticketTitle?: string;
  workspaceId: string;
  specialty?: string;
  invitedTradespersonIds: string[];
  diagnosis?: {
    probableIssue?: string;
    inspectionPoints?: string[];
    recommendedTools?: string[];
    safetyNotes?: string[];
  };
};

/**
 * Resolve the matched-trade audience and send the broadcast email. Mirrors
 * the trade inbox discovery query exactly so what the trade sees in their
 * dashboard is the same population that gets the email.
 */
async function fanOutBroadcastEmails(input: FanOutInput) {
  const business = await Business.findById(input.workspaceId)
    .select("name")
    .lean<{ name?: string }>();
  const businessName = business?.name ?? "A workspace";

  // 1. Identify recipient trades.
  let recipientTradeIds: string[] = [];
  if (input.invitedTradespersonIds.length > 0) {
    recipientTradeIds = input.invitedTradespersonIds;
  } else if (input.specialty) {
    const links = await WorkspaceTrade.find({
      workspace: input.workspaceId,
      status: WORKSPACE_TRADE_STATUS.ACTIVE,
    })
      .select("tradesperson")
      .lean<{ tradesperson: unknown }[]>();
    const linkedIds = links.map((l) => String(l.tradesperson));
    if (linkedIds.length === 0) return;
    const specialtyMatches = await Tradesperson.find({
      _id: { $in: linkedIds },
      isActive: true,
      specialties: input.specialty,
    })
      .select("_id")
      .lean<{ _id: unknown }[]>();
    recipientTradeIds = specialtyMatches.map((t) => String(t._id));
  }
  if (recipientTradeIds.length === 0) return;

  // 2. Look up the recipient emails.
  const trades = await Tradesperson.find({ _id: { $in: recipientTradeIds } })
    .select("businessName contactEmail")
    .lean<{ businessName?: string; contactEmail: string }[]>();

  const diagnosisText = input.diagnosis?.probableIssue
    ? `Probable issue: ${input.diagnosis.probableIssue}\n\n`
    : "";

  // 3. Send in parallel — failures are swallowed per-recipient by the helper.
  await Promise.all(
    trades.map((t) => {
      const inboxUrl = `${input.requestUrl}/trades/requests`;
      const bodyText = [
        `${businessName} just broadcast a repair request${
          input.specialty ? ` for ${input.specialty.toLowerCase()}` : ""
        }.`,
        ``,
        input.ticketTitle ? `Job: ${input.ticketTitle}` : ``,
        diagnosisText,
        `Open your inbox to review and submit a quote:`,
        inboxUrl,
      ]
        .filter(Boolean)
        .join("\n");
      return sendTradeSystemEmail({
        to: t.contactEmail,
        subject: `New repair request from ${businessName}`,
        preheader: `${businessName} has a new repair${input.specialty ? ` in ${input.specialty.toLowerCase()}` : ""}.`,
        bodyText,
      });
    }),
  );
}
