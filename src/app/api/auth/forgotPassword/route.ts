import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email/senders/auth/sendPasswordResetEmail";
import { z } from "zod";

connect();

const forgotPasswordBodySchema = z.object({
  email: z.string().email("Please provide a valid email"),
});

export async function POST(request: NextRequest) {
  try {
    const { email } = parseOrThrow(
      forgotPasswordBodySchema,
      await request.json()
    );

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      throw ApiError.badRequest("User does not exist");
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const emailResult = await sendPasswordResetEmail({
      request,
      to: user.email,
      attendeeName: user.name,
      resetToken,
    });

    if (!emailResult.sent) {
      throw ApiError.unavailable(
        emailResult.error ||
          emailResult.skippedReason ||
          "Unable to send password reset email"
      );
    }

    const response = NextResponse.json({
      status: "success",
      message: "Token sent to email",
    });

    // const timeInMs = Number(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 1000; // 2 minutes in milliseconds
    // const expires = new Date(Date.now() + timeInMs);
    // response.cookies.set("token", token, {
    //   httpOnly: true,
    //   expires,
    // });

    return response;
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
