import { NextRequest } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { buildAuthSuccessResponse } from "@/lib/auth/issue-auth-session";
import {
  assertPasswordPolicy,
  getAppPasswordPolicy,
} from "@/lib/security/password-policy";
import User from "@/models/userModel";
import Tradesperson from "@/models/tradespersonModel";
import { ACCOUNT_KIND } from "@/shared/enums/account-kind";
import { buildTradeSlug } from "@/lib/trades/trade-slug";
import { isSlugDuplicateKeyError } from "@/lib/tickets/ticket-slug";
import { TradeSignupSchema } from "@/features/trades/models/trade-signup.schema";
import type { TechnicianSpecialty } from "@/features/technicians/models/technician-specialty.model";

const getRequestId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

const SLUG_RETRY_LIMIT = 5;

/**
 * Self-signup endpoint for external tradespeople. Creates a User with
 * `accountKind: trade` and a linked `Tradesperson` profile. The user has no
 * workspace memberships — they're linked to workspaces later via
 * `WorkspaceTrade` (invite acceptance or admin-add).
 *
 * Mirrors eventSphere's /api/auth/vendor/register pattern. No business is
 * created; the response auto-logs the user in so they land on /trades.
 */
export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();
    const attemptedRoleAssignment =
      "platformRole" in body ||
      "role" in body ||
      "memberships" in body ||
      "currentBusiness" in body ||
      "accountKind" in body;
    if (attemptedRoleAssignment) {
      throw ApiError.badRequest(
        "Role or account-kind assignment is not allowed during signup",
      );
    }

    const payload = parseOrThrow(TradeSignupSchema, body);
    const passwordPolicy = await getAppPasswordPolicy();
    assertPasswordPolicy(payload.password, passwordPolicy);

    const exists = await User.findOne({ email: payload.email });
    if (exists) throw ApiError.badRequest("Email already in use");

    const newUser = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      contact: payload.contact,
      countryCode: payload.countryCode,
      accountKind: ACCOUNT_KIND.TRADE,
      passwordChangedAt: new Date(),
      emailVerifiedAt: new Date(),
    });

    // Retry on slug collision — the random tail makes this extremely rare,
    // but a partner workspace test fixture could re-use the same business
    // name, so we don't want a 500 here.
    let createdProfile = null;
    let lastErr: unknown;
    for (let i = 0; i < SLUG_RETRY_LIMIT; i++) {
      try {
        createdProfile = await Tradesperson.create({
          userId: newUser._id,
          slug: buildTradeSlug(payload.businessName),
          businessName: payload.businessName,
          contactEmail: payload.email,
          contactPhone: payload.contact,
          specialties: (payload.specialties ?? []) as TechnicianSpecialty[],
        });
        break;
      } catch (err) {
        lastErr = err;
        if (!isSlugDuplicateKeyError(err)) throw err;
      }
    }
    if (!createdProfile) {
      throw lastErr instanceof Error
        ? lastErr
        : new Error("Failed to allocate a unique trade slug");
    }

    return buildAuthSuccessResponse({
      request,
      user: newUser,
      status: 201,
      body: {
        status: "success",
        data: {
          user: newUser,
          tradesperson: createdProfile,
        },
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
