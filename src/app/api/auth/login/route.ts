import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { buildAuthSuccessResponse } from "@/lib/auth/issue-auth-session";
import { NextRequest } from "next/server";
import User, { UserDoc } from "@/models/userModel";
import { ROLES } from "@/shared/enums/enums";
import { z } from "zod";

connect();

const getLegacyTokenPreview = (user: UserDoc) => {
  const tenants = user.tenantsClaim();

  const tenant = tenants.find(
    (tenant) => user.currentBusiness.toString() === tenant.business
  );

  return {
    id: user.id,
    role: tenant?.role || ROLES.user,
    tenants,
  };
};

const loginBodySchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(1, "Please provide a password"),
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = parseOrThrow(
      loginBodySchema,
      await request.json()
    );

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw ApiError.badRequest("Incorrect email or password");
    }

    return buildAuthSuccessResponse({
      request,
      user,
      body: {
        status: "success",
        ...getLegacyTokenPreview(user),
      },
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
