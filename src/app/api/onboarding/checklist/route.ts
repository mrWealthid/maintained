// app/api/onboarding/checklist/route.ts
import { NextResponse } from "next/server";
import Property from "@/models/propertyModel";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";

export async function GET(req: Request) {
  try {
    const me = await getUserFromCookies();
    if (!me?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const businessId = me.currentBusiness;
    if (!businessId)
      return NextResponse.json(
        { error: "businessId required" },
        { status: 400 }
      );

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
        "memberships.role": "ADMIN",
        "memberships.status": "ACTIVATED",
      }),
      User.countDocuments({
        "memberships.business": businessId,
        "memberships.role": "TECHNICIAN",
        "memberships.status": "ACTIVATED",
      }),
      User.countDocuments({
        "memberships.business": businessId,
        "memberships.role": "USER",
        "memberships.status": "ACTIVATED",
      }),
    ]);

    // You can pull email verification from your auth profile if you store it
    const emailVerified = true;

    return NextResponse.json({
      emailVerified,
      propertiesCount,
      unitsCount,
      adminsCount,
      techniciansCount,
      tenantsCount,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
