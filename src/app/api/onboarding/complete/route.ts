import { NextRequest, NextResponse } from "next/server";

import Business from "@/models/businessModel";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

export async function POST(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    await assertWorkspacePermissionKey(
      verify,
      PERMISSION.SETTINGS_PROFILE_MANAGE,
    );

    const businessId = verify.businessId;
    if (!businessId) throw ApiError.badRequest("businessId required");

    const business = await Business.findById(businessId).select(
      "onboardingCompletedAt",
    );
    if (!business) throw ApiError.notFound("Workspace not found");

    if (!business.onboardingCompletedAt) {
      business.onboardingCompletedAt = new Date();
      await business.save();
    }

    return NextResponse.json({
      status: "success",
      data: { onboardingCompletedAt: business.onboardingCompletedAt },
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
