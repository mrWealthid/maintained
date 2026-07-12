import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
import WorkspaceTrade from "@/models/workspaceTradeModel";
import { WORKSPACE_TRADE_STATUS } from "@/features/trades/models/trade-status.model";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

const AcceptSchema = z.object({
  token: z.string().min(8),
});

/**
 * POST /api/trades/invite/accept
 *
 * Trade-side acceptance of a `WorkspaceTrade` invite. The caller must be
 * logged in as the same trade that the invite was issued to (matched by
 * `tradesperson.userId`). Flips status `invited` → `active` and clears the
 * token.
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
      .select("_id");
    if (!trade) throw ApiError.forbidden("Trade profile required");

    const payload = parseOrThrow(AcceptSchema, await request.json());

    const link = await WorkspaceTrade.findOne({
      inviteToken: payload.token,
    });
    if (!link) throw ApiError.notFound("Invite not found or already used");
    if (
      link.inviteTokenExpires &&
      link.inviteTokenExpires.getTime() < Date.now()
    ) {
      throw ApiError.conflict("Invite has expired");
    }
    if (String(link.tradesperson) !== trade.id) {
      throw ApiError.forbidden(
        "This invite was issued to a different tradesperson",
      );
    }

    link.status = WORKSPACE_TRADE_STATUS.ACTIVE;
    link.inviteToken = undefined;
    link.inviteTokenExpires = undefined;
    await link.save();

    return NextResponse.json({
      ok: true,
      data: { workspaceTrade: link },
    });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
