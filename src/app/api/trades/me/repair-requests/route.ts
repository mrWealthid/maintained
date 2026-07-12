import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
} from "@/lib/errors/apiError";
import {
  getVerifiedUserState,
  VERIFIED_USER_STATE_STATUS,
} from "@/lib/auth/getVerifiedUser";
import { ACCOUNT_KIND } from "@/shared/enums/account-kind";
import RepairRequest from "@/models/repairRequestModel";
import Tradesperson from "@/models/tradespersonModel";
import WorkspaceTrade from "@/models/workspaceTradeModel";
import Ticket from "@/models/ticketModel";
import User from "@/models/userModel";
import { REPAIR_REQUEST_STATUS } from "@/features/repair-requests/models/repair-request-status.model";
import { WORKSPACE_TRADE_STATUS } from "@/features/trades/models/trade-status.model";

const VALID_TABS = ["all", "broadcast", "invited"] as const;
type Tab = (typeof VALID_TABS)[number];

function parseTab(value: string | null): Tab {
  return (VALID_TABS as readonly string[]).includes(value ?? "")
    ? (value as Tab)
    : "all";
}

/**
 * GET /api/trades/me/repair-requests?tab=all|broadcast|invited
 *
 * Returns open RepairRequests visible to the calling tradesperson.
 *
 *   - `invited`   : I'm explicitly in the request's `invitedTradespeople`.
 *   - `broadcast` : The request has no shortlist AND its `specialty` is
 *                   one of mine.
 *   - `all`       : The union of the two above.
 *
 * Mirrors eventSphere's /api/vendors/me/incoming-requests filter logic.
 * Phase 2 returns just the raw request set — quotes I've submitted, my
 * decline state, etc. arrive with the Phase 3 quote flow.
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
      .select("_id specialties")
      .lean<{ _id: unknown; specialties: string[] }>();
    if (!trade) {
      throw ApiError.forbidden("Trade profile required");
    }

    const tab = parseTab(request.nextUrl.searchParams.get("tab"));
    const tradeId = trade._id;
    const specialties = trade.specialties ?? [];

    // Workspaces I'm actively linked to. An open broadcast is only visible
    // if it originated from one of these; direct invites are always visible
    // regardless of the link (the invite IS the link signal).
    const activeLinks = await WorkspaceTrade.find({
      tradesperson: tradeId,
      status: WORKSPACE_TRADE_STATUS.ACTIVE,
    })
      .select("workspace")
      .lean<{ workspace: unknown }[]>();
    const linkedWorkspaceIds = activeLinks.map((l) => String(l.workspace));

    let filter: Record<string, unknown> = {
      status: REPAIR_REQUEST_STATUS.OPEN,
    };

    if (tab === "invited") {
      filter = { ...filter, invitedTradespeople: tradeId };
    } else if (tab === "broadcast") {
      filter = {
        ...filter,
        invitedTradespeople: { $size: 0 },
        specialty: { $in: specialties.length ? specialties : ["__none__"] },
        workspace: { $in: linkedWorkspaceIds.length ? linkedWorkspaceIds : ["__none__"] },
      };
    } else {
      // all — union of (invited, anywhere) ∪ (broadcast, linked workspaces).
      filter.$or = [
        { invitedTradespeople: tradeId },
        {
          invitedTradespeople: { $size: 0 },
          specialty: { $in: specialties.length ? specialties : ["__none__"] },
          workspace: { $in: linkedWorkspaceIds.length ? linkedWorkspaceIds : ["__none__"] },
        },
      ];
    }

    const repairRequests = await RepairRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Enrich with a small slice of the ticket so the inbox can render
    // without needing a second round-trip.
    const ticketIds = Array.from(
      new Set(repairRequests.map((r) => String(r.ticket))),
    );
    const tickets = ticketIds.length
      ? await Ticket.find({ _id: { $in: ticketIds } })
          .select("title slug priority area propertyName unitLabel createdAt")
          .lean<
            Array<{
              _id: unknown;
              title?: string;
              slug?: string;
              priority?: string;
              area?: string;
              propertyName?: string;
              unitLabel?: string;
              createdAt?: Date;
            }>
          >()
      : [];
    const ticketsById = new Map(tickets.map((t) => [String(t._id), t]));

    return NextResponse.json({
      ok: true,
      data: repairRequests.map((r) => ({
        ...r,
        ticket: ticketsById.get(String(r.ticket)) ?? null,
      })),
    });
  } catch (error) {
    return errorToNextResponse(
      error,
      request.headers.get("x-request-id") ?? undefined,
    );
  }
}
