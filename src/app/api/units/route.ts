// app/api/units/route.ts
import { NextResponse } from "next/server";
import Unit from "@/models/unitModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";

export async function GET(req: Request) {
  try {
    const me = await getUserFromCookies();
    if (!me?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const businessId = me.currentBusiness;
    const propertyId = url.searchParams.get("propertyId");

    console.log(url);
    console.log(businessId);
    if (!businessId)
      return NextResponse.json(
        { error: "businessId required" },
        { status: 400 }
      );

    const q: any = { business: businessId, isActive: true };
    if (propertyId) q.property = propertyId;

    const units = await Unit.find(q)
      .select("_id label property tenantActive tenantUser")
      .lean();

    console.log(units);

    return NextResponse.json({ status: "success", data: units });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const me = await getUserFromCookies();
    if (!me?.isAdminRole)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { businessId, propertyId, label, floor, tags } = await req.json();
    if (!businessId || !propertyId || !label)
      return NextResponse.json(
        { error: "businessId, propertyId, label required" },
        { status: 400 }
      );

    const unit = await Unit.create({
      business: businessId,
      property: propertyId,
      label,
      floor,
      tags,
      isActive: true,
    });

    return NextResponse.json(
      { status: "success", data: unit },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
