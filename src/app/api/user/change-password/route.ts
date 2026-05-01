import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import User from "@/models/userModel";
import { sendPasswordChangePasscodeEmail } from "@/lib/email/senders/security/sendPasswordChangePasscodeEmail";

connect();

const requestPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const completePasswordChangeSchema = z.object({
  passcode: z
    .string()
    .regex(/^\d{6}$/, "Passcode must be 6 digits"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function POST(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    const { currentPassword } = parseOrThrow(
      requestPasswordChangeSchema,
      await request.json()
    );

    const user = await User.findById(verify.id).select("+password");
    if (!user) throw ApiError.notFound("User not found");

    if (!(await user.correctPassword(currentPassword, user.password))) {
      throw ApiError.badRequest("Current password is incorrect");
    }

    const passcode = user.createPasswordChangePasscode();
    await user.save({ validateBeforeSave: false });

    const emailResult = await sendPasswordChangePasscodeEmail({
      to: user.email,
      attendeeName: user.name,
      passcode,
    });

    if (!emailResult.sent) {
      throw ApiError.unavailable(
        emailResult.error ||
          emailResult.skippedReason ||
          "Unable to send password change passcode email"
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Verification passcode sent to your email",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function PUT(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    const { passcode, newPassword } = parseOrThrow(
      completePasswordChangeSchema,
      await request.json()
    );

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    if (!user.passwordChangePasscode || !user.passwordChangePasscodeExpires) {
      throw ApiError.badRequest(
        "No active passcode found. Please request a new one."
      );
    }

    if (new Date() > user.passwordChangePasscodeExpires) {
      throw ApiError.badRequest(
        "Passcode has expired. Please request a new one."
      );
    }

    const hashedPasscode = crypto
      .createHash("sha256")
      .update(passcode)
      .digest("hex");

    if (hashedPasscode !== user.passwordChangePasscode) {
      throw ApiError.badRequest("Invalid passcode");
    }

    user.password = newPassword;
    user.passwordConfirm = newPassword;
    user.passwordChangePasscode = undefined;
    user.passwordChangePasscodeExpires = undefined;
    await user.save();

    return NextResponse.json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
