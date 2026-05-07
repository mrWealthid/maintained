import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { connect } from "@/dbConfig/dbConfig";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import {
  assertPasswordPolicy,
  getAppPasswordPolicy,
} from "@/lib/security/password-policy";
import { sendPasswordUpdatedEmail } from "@/lib/email/senders/security/sendPasswordUpdatedEmail";

const resetPasswordBodySchema = z.object({
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    await connect();

    const { resetToken, newPassword } = resetPasswordBodySchema.parse(
      await request.json(),
    );
    const passwordPolicy = await getAppPasswordPolicy();
    assertPasswordPolicy(newPassword, passwordPolicy);

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      throw ApiError.badRequest("Token is invalid or has expired");
    }

    if (!user.password) {
      throw ApiError.badRequest("Password reset is unavailable for this account");
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    try {
      const emailResult = await sendPasswordUpdatedEmail({
        request,
        to: user.email,
        attendeeName: user.name,
      });

      if (!emailResult.sent && !emailResult.skippedReason) {
        console.error(
          "Password updated email failed:",
          emailResult.error ?? "unknown error",
        );
      }
    } catch (emailError) {
      console.error(
        "Password updated email failed:",
        emailError instanceof Error ? emailError.message : "unknown error",
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Password reset successfully! Kindly login with your new password.",
    });
  } catch (error) {
    return errorToNextResponse(
      error,
      request.headers.get("x-request-id") ?? undefined,
    );
  }
}
