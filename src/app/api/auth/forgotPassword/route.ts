import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { Emails } from "@/utils/email-resend";
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

    const resetURL =
      process.env.NODE_ENV === "development"
        ? `${process.env.DEVELOPMENT_URL}/auth/updatePassword/${resetToken}`
        : `${process.env.PRODUCTION_URL}/auth/updatePassword/${resetToken}`;

    await new Emails(user, null, resetURL).sendPasswordReset();

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
