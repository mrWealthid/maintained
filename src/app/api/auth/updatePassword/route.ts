import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { buildAuthSuccessResponse } from "@/lib/auth/issue-auth-session";
import User, { UserDoc } from "@/models/userModel";
import { NextRequest } from "next/server";
import { z } from "zod";

const updatePasswordBodySchema = z.object({
  email: z.string().email("Please provide a valid email"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    await connect();

    const { email, newPassword, currentPassword } = parseOrThrow(
      updatePasswordBodySchema,
      await request.json()
    );

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (!(await user.correctPassword(currentPassword, user.password))) {
      throw ApiError.badRequest("Your current password is wrong");
    }

    user.password = newPassword;
    user.passwordConfirm = newPassword;
    await user.save();

    return buildAuthSuccessResponse({
      request,
      user: user as UserDoc,
      body: {
        status: "success",
        message: "Token sent to email",
      },
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
