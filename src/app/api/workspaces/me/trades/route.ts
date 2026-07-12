import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

import WorkspaceTrade from "@/models/workspaceTradeModel";
import Tradesperson from "@/models/tradespersonModel";
import Business from "@/models/businessModel";
import { sendTradeSystemEmail } from "@/lib/email/clients/trade-system-email.client";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { WORKSPACE_TRADE_STATUS } from "@/features/trades/models/trade-status.model";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

const INVITE_TTL_DAYS = 14;

const InviteSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

/**
 * POST /api/workspaces/me/trades — invite a tradesperson into the caller's
 * workspace by their account email. The trade must already have signed up
 * at `/auth/signup?kind=trade`; if no Tradesperson is found for that
 * email, we 404 and the admin can share the signup link.
 *
 * Idempotent on (workspace, tradesperson) — re-inviting the same trade
 * rotates the token in place instead of creating a duplicate row.
 */
export async function POST(request: NextRequest) {
  try {
    await connect();
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    if (verify.isUserRole || verify.isTechnicianRole) throw ApiError.forbidden();
    await assertLegacyWorkspacePermission(
      verify,
      PERMISSION.TECHNICIAN_REQUESTS_MANAGE,
    );

    const payload = parseOrThrow(InviteSchema, await request.json());

    const trade = await Tradesperson.findOne({ contactEmail: payload.email });
    if (!trade) {
      throw ApiError.notFound(
        "No tradesperson account found for that email. Share /auth/signup?kind=trade with them and try again.",
      );
    }
    if (!trade.isActive) {
      throw ApiError.conflict("Tradesperson account is not active");
    }

    const token = crypto.randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

    // Upsert via the unique index on (workspace, tradesperson). If the link
    // exists in ACTIVE state we still rotate the token so the trade can be
    // re-invited (e.g. after a status change).
    const link = await WorkspaceTrade.findOneAndUpdate(
      {
        workspace: verify.currentBusiness,
        tradesperson: trade._id,
      },
      {
        $set: {
          status: WORKSPACE_TRADE_STATUS.INVITED,
          inviteToken: token,
          inviteTokenExpires: expiresAt,
          invitedEmail: payload.email,
        },
        $setOnInsert: {
          addedBy: verify.id,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Send the invite email best-effort.
    try {
      const business = await Business.findById(verify.currentBusiness)
        .select("name")
        .lean<{ name?: string }>();
      const acceptUrl = `${resolveAppBaseUrl(request)}/trades/invite/${token}`;
      const businessName = business?.name ?? "A workspace";
      const bodyText = [
        `${businessName} has invited you to join their tradesperson list on Properly.`,
        ``,
        `Click the link below to accept and start receiving repair requests:`,
        acceptUrl,
        ``,
        `This invite expires in ${INVITE_TTL_DAYS} days.`,
      ].join("\n");
      await sendTradeSystemEmail({
        to: trade.contactEmail,
        subject: `${businessName} invited you to join their trades`,
        preheader: `${businessName} added you on Properly. Accept to start receiving repair requests.`,
        bodyText,
      });
    } catch (err) {
      console.error("[workspaces/me/trades POST] invite email failed", err);
    }

    return NextResponse.json({
      ok: true,
      data: {
        workspaceTrade: link,
        invite: {
          acceptPath: `/trades/invite/${token}`,
          expiresAt,
        },
      },
    });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}

/**
 * GET /api/workspaces/me/trades — list workspace's linked trades for the
 * admin UI. Populates the trade slice for inline display.
 */
export async function GET(request: NextRequest) {
  try {
    await connect();
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    if (verify.isUserRole || verify.isTechnicianRole) throw ApiError.forbidden();
    await assertLegacyWorkspacePermission(
      verify,
      PERMISSION.TECHNICIAN_REQUESTS_VIEW,
    );

    const links = await WorkspaceTrade.find({ workspace: verify.currentBusiness })
      .populate({
        path: "tradesperson",
        select: "businessName slug contactEmail specialties verificationStatus isActive",
      })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, data: links });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
