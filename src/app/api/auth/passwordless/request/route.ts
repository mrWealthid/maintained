import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { sendPasswordlessLoginEmail } from "@/lib/email/senders/auth/sendPasswordlessLoginEmail";
import { getAppSecuritySettings } from "@/lib/security/app-security";
import {
  getAppPasswordPolicy,
  isPasswordExpired,
} from "@/lib/security/password-policy";
import { ROLES } from "@/shared/enums/enums";

const PasswordlessRequestSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  next: z.string().optional(),
});

const successResponse = () =>
  NextResponse.json({
    status: "success",
    message:
      "If an eligible account exists, a passwordless sign-in link has been sent.",
  });

export async function POST(request: NextRequest) {
  try {
    await connect();

    const parsed = parseOrThrow(
      PasswordlessRequestSchema,
      await request.json()
    );
    const email = parsed.email.toLowerCase().trim();

    const user = await User.findOne({ email }).select(
      "name email memberships currentBusiness createdAt passwordChangedAt +passwordlessLoginToken +passwordlessLoginExpires"
    );

    if (!user) {
      return successResponse();
    }

    const currentMembership = user.memberships.find(
      (m) => m.business.toString() === user.currentBusiness?.toString()
    );

    if (currentMembership?.role === ROLES.super_admin) {
      throw ApiError.forbidden(
        "Passwordless sign-in is not available for platform admin accounts."
      );
    }

    const [appSecuritySettings, passwordPolicy] = await Promise.all([
      getAppSecuritySettings(),
      getAppPasswordPolicy(),
    ]);

    if (!appSecuritySettings.passwordlessLogin) {
      throw ApiError.forbidden(
        "Passwordless sign-in is not enabled right now."
      );
    }

    if (
      isPasswordExpired({
        passwordChangedAt: user.passwordChangedAt,
        fallbackDate: user.createdAt,
        policy: passwordPolicy,
      })
    ) {
      throw ApiError.forbidden(
        "Your password has expired. Reset your password to continue."
      );
    }

    const loginToken = user.createPasswordlessLoginToken();
    await user.save({ validateBeforeSave: false });

    const emailResult = await sendPasswordlessLoginEmail({
      request,
      to: user.email,
      attendeeName: user.name,
      loginToken,
      next: parsed.next,
    });

    if (!emailResult.sent) {
      throw ApiError.unavailable(
        emailResult.error ||
          emailResult.skippedReason ||
          "Unable to send the passwordless sign-in email"
      );
    }

    return successResponse();
  } catch (error) {
    return errorToNextResponse(
      error,
      request.headers.get("x-request-id") ?? undefined
    );
  }
}
