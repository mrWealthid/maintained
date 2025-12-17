// app/api/units/route.ts
import { NextRequest, NextResponse } from "next/server";
import Unit from "@/models/unitModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { mapToObject } from "@/utils/helpers";
import APIFeatures from "@/utils/apiFeatures";
import { Unit as IUnit } from "@/features/property-feat/service/unit-service";

export async function GET(req: NextRequest) {
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

    // Build filter object
    const filter: any = { business: businessId, isActive: true };
    const query: any = req.nextUrl.searchParams;

    const transformedQuery = mapToObject(query);
    console.log(transformedQuery);

    if (transformedQuery.propertyId) {
      filter.property = transformedQuery.propertyId;
      delete transformedQuery.propertyId;
    }
    // if (transformedQuery.property) filter.property = transformedQuery.property;
    if (transformedQuery.label) {
      filter.label = { $regex: transformedQuery.label, $options: "i" };

      delete transformedQuery.label;
    }
    // if (
    //   transformedQuery.status !== null &&
    //   transformedQuery.status !== undefined
    // ) {
    //   filter.tenantActive = transformedQuery.status === "true";
    // }

    if (transformedQuery.tenant) {
      filter["tenantUser.name"] = {
        $regex: transformedQuery.tenant,
        $options: "i",
      };
      delete transformedQuery.tenant;
    }

    const requestQuery = Unit.find(filter);

    const features = new APIFeatures(requestQuery, transformedQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate([
        { path: "property", select: "name" },
        { path: "tenantUser", select: "name email" },
      ]);
    const units = await features.query;

    const countFeatures = new APIFeatures<IUnit>(
      Unit.find(filter),
      transformedQuery
    ).filter();

    const count = await countFeatures.query.countDocuments();

    return NextResponse.json({
      totalRecords: count,
      results: units.length,
      status: "success",
      data: units,
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
