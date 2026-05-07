import { NextRequest, NextResponse } from "next/server";

import Property from "@/models/propertyModel";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import Business from "@/models/businessModel";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { INVITE_STATUS, ROLES } from "@/shared/enums/enums";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    await assertWorkspacePermissionKey(
      verify,
      PERMISSION.WORKSPACE_DASHBOARD_VIEW,
    );

    const businessId = verify.businessId;
    if (!businessId) throw ApiError.badRequest("businessId required");

    const [
      user,
      business,
      propertiesCount,
      unitsCount,
      adminsCount,
      techniciansCount,
      tenantsCount,
    ] = await Promise.all([
      User.findById(verify.id).select("emailVerifiedAt").lean<{
        emailVerifiedAt?: Date | null;
      } | null>(),
      Business.findById(businessId)
        .select("workspaceType onboardingCompletedAt")
        .lean<{
          workspaceType?: string;
          onboardingCompletedAt?: Date | null;
        } | null>(),
      Property.countDocuments({ business: businessId, isActive: true }),
      Unit.countDocuments({ business: businessId, isActive: true }),
      User.countDocuments({
        "memberships.business": businessId,
        "memberships.role": ROLES.admin,
        "memberships.status": INVITE_STATUS.activated,
      }),
      User.countDocuments({
        "memberships.business": businessId,
        "memberships.role": ROLES.technician,
        "memberships.status": INVITE_STATUS.activated,
      }),
      User.countDocuments({
        "memberships.business": businessId,
        "memberships.role": ROLES.tenant,
        "memberships.status": INVITE_STATUS.activated,
      }),
    ]);

    return NextResponse.json({
      status: "success",
      data: {
        emailVerified: Boolean(user?.emailVerifiedAt),
        emailVerifiedAt: user?.emailVerifiedAt ?? null,
        onboardingCompletedAt: business?.onboardingCompletedAt ?? null,
        workspaceType: business?.workspaceType ?? null,
        counts: {
          properties: propertiesCount,
          units: unitsCount,
          admins: adminsCount,
          technicians: techniciansCount,
          tenants: tenantsCount,
        },
      },
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
