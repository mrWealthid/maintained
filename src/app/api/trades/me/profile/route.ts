import { NextRequest, NextResponse } from "next/server";

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
import { TradeProfileUpdateSchema } from "@/features/trades/models/trade-profile.schema";
import type { TechnicianSpecialty } from "@/features/technicians/models/technician-specialty.model";

const reqId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

/** GET — return the calling trade's profile. */
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
    const trade = await Tradesperson.findOne({ userId: state.user.id });
    if (!trade) throw ApiError.notFound("Trade profile not found");
    return NextResponse.json({ ok: true, data: { tradesperson: trade } });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}

/**
 * PATCH — partial update of the calling trade's profile. The
 * Tradesperson model's `pre('validate')` hook enforces the ≥1-specialty
 * invariant; the schema rejects empty arrays before we even call `save()`.
 */
export async function PATCH(request: NextRequest) {
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

    const trade = await Tradesperson.findOne({ userId: state.user.id });
    if (!trade) throw ApiError.notFound("Trade profile not found");

    const payload = parseOrThrow(
      TradeProfileUpdateSchema,
      await request.json(),
    );

    if (payload.businessName !== undefined) trade.businessName = payload.businessName;
    if (payload.contactPhone !== undefined) trade.contactPhone = payload.contactPhone;
    if (payload.description !== undefined) trade.description = payload.description;
    if (payload.specialties !== undefined) {
      trade.specialties = payload.specialties as TechnicianSpecialty[];
    }
    if (payload.address !== undefined) trade.address = payload.address;
    if (payload.serviceAreaKm !== undefined) trade.serviceAreaKm = payload.serviceAreaKm;

    await trade.save();

    return NextResponse.json({ ok: true, data: { tradesperson: trade } });
  } catch (error) {
    return errorToNextResponse(error, reqId(request));
  }
}
