import { connect } from "@/dbConfig/dbConfig";
import { buildAuthSuccessResponse } from "@/lib/auth/issue-auth-session";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import User, { UserDoc } from "@/models/userModel";
import { INVITE_STATUS } from "@/shared/enums/enums";
import { NextRequest } from "next/server";
import { z } from "zod";

connect();

const switchBusinessBodySchema = z.object({
  currentBusiness: z.string().min(1, "Workspace is required"),
});

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function PATCH(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    const { currentBusiness } = parseOrThrow(
      switchBusinessBodySchema,
      await request.json()
    );

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    const membership = user.memberships.find(
      (item) =>
        String(item.business) === currentBusiness &&
        item.status === INVITE_STATUS.activated
    );

    if (!membership) {
      throw ApiError.forbidden("You do not have access to this workspace");
    }

    user.currentBusiness = membership.business;
    await user.save({ validateBeforeSave: false });

    const response = await buildAuthSuccessResponse({
      request,
      user: user as UserDoc,
      body: {
        status: "success",
        data: user,
      },
    });

    response.cookies.set("activeBusiness", String(currentBusiness), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
