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

    if (!businessId)
      return NextResponse.json(
        { error: "businessId required" },
        { status: 400 }
      );

    // Get query parameters
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const label = url.searchParams.get("label");
    const property = url.searchParams.get("property");
    const status = url.searchParams.get("status");
    const tenant = url.searchParams.get("tenant");

    // Build filter object
    const filter: any = { business: businessId, isActive: true };

    if (propertyId) filter.property = propertyId;
    if (property) filter.property = property;
    if (label) filter.label = { $regex: label, $options: "i" };
    if (status !== null && status !== undefined) {
      filter.tenantActive = status === "true";
    }
    if (tenant) {
      filter["tenantUser.name"] = { $regex: tenant, $options: "i" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalRecords = await Unit.countDocuments(filter);

    // Get units with pagination and populate property and tenant data
    const units = await Unit.find(filter)
      .populate("property", "name")
      .populate("tenantUser", "name email")
      .select(
        "_id label floor isActive property tenantUser tenantActive tenants tags createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      status: "success",
      data: units,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        hasNext: page < Math.ceil(totalRecords / limit),
        hasPrev: page > 1,
      },
    });
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
