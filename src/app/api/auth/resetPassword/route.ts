import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { buildAuthSuccessResponse } from "@/lib/auth/issue-auth-session";
import User from "@/models/userModel";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { z } from "zod";

connect();

const resetPasswordBodySchema = z
  .object({
    resetToken: z.string().min(1, "Reset token is required"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string().min(8, "Please confirm your new password"),
  })
  .refine((body) => body.newPassword === body.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  });

export async function POST(request: NextRequest) {
  try {
    const { newPassword, currentPassword, confirmNewPassword, resetToken } =
      parseOrThrow(resetPasswordBodySchema, await request.json());

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

    if (!(await user.correctPassword(currentPassword, user.password))) {
      throw ApiError.badRequest("Your current password is wrong");
    }

    if (currentPassword === newPassword) {
      throw ApiError.badRequest("You can't use your old password");
    }

    user.password = newPassword;
    user.passwordConfirm = confirmNewPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return buildAuthSuccessResponse({
      request,
      user,
      body: {
        status: "success",
        message: "Password reset successfully! Kindly Login with Credentials",
      },
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
