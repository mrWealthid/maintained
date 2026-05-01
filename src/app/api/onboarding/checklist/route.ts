// app/api/onboarding/checklist/route.ts
import { NextRequest, NextResponse } from "next/server";

import Property from "@/models/propertyModel";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { INVITE_STATUS, ROLES } from "@/shared/enums/enums";

export async function GET(req: NextRequest) {
  try {
    const me = await getUserFromCookies();
    if (!me?.id) throw ApiError.unauthorized();

    const businessId = me.currentBusiness;
    if (!businessId) throw ApiError.badRequest("businessId required");

    const [
      propertiesCount,
      unitsCount,
      adminsCount,
      techniciansCount,
      tenantsCount,
    ] = await Promise.all([
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
        "memberships.role": ROLES.user,
        "memberships.status": INVITE_STATUS.activated,
      }),
    ]);

    const emailVerified = true;

    return NextResponse.json({
      emailVerified,
      propertiesCount,
      unitsCount,
      adminsCount,
      techniciansCount,
      tenantsCount,
    });
  } catch (error) {
    return errorToNextResponse(error, req.headers.get("x-request-id"));
  }
}
