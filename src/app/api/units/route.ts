// app/api/units/route.ts
import { NextRequest, NextResponse } from "next/server";
import Unit from "@/models/unitModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { mapToObject } from "@/utils/helpers";
import APIFeatures from "@/utils/apiFeatures";

export async function GET(req: NextRequest) {
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

    // // Get query parameters
    // const page = parseInt(url.searchParams.get("page") || "1");
    // const limit = parseInt(url.searchParams.get("limit") || "10");
    // const label = url.searchParams.get("label");
    // const property = url.searchParams.get("property");
    // const status = url.searchParams.get("status");
    // const tenant = url.searchParams.get("tenant");

    // Build filter object
    const filter: any = { business: businessId, isActive: true };
    const query: any = req.nextUrl.searchParams;

    const transformedQuery = mapToObject(query);
    if (propertyId) filter.property = propertyId;

    // if (transformedQuery.property) filter.property = transformedQuery.property;
    if (transformedQuery.label) {
      filter.label = { $regex: transformedQuery.label, $options: "i" };

      delete transformedQuery.label;
    }
    if (
      transformedQuery.status !== null &&
      transformedQuery.status !== undefined
    ) {
      filter.tenantActive = transformedQuery.status === "true";
    }
    if (transformedQuery.tenant) {
      filter["tenantUser.name"] = {
        $regex: transformedQuery.tenant,
        $options: "i",
      };
      delete transformedQuery.label;
    }
    if (
      transformedQuery.status !== null &&
      transformedQuery.status !== undefined
    ) {
      filter.tenantActive = transformedQuery.status === "true";
      delete transformedQuery.status;
    }
    if (transformedQuery.tenant) {
      filter["tenantUser.name"] = {
        $regex: transformedQuery.tenant,
        $options: "i",
      };
      delete transformedQuery.tenant;
    }
    if (transformedQuery.label) {
      filter.label = { $regex: transformedQuery.label, $options: "i" };
      filter.tenantActive = status === "true";
      delete transformedQuery.label;
    }
    if (transformedQuery.tenant) {
      filter["tenantUser.name"] = {
        $regex: transformedQuery.tenant,
        $options: "i",
      };
      delete transformedQuery.tenant;
    }

    // // Calculate pagination
    // const skip = (page - 1) * limit;

    // // Get total count
    // const totalRecords = await Unit.countDocuments(filter);

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

    let count;

    // console.log( await Model.find(req.query))

    //I did this because pagination of filtered data was impossible, The endpoint keeps returning the total count of all document

    if (Object.values(transformedQuery).length > 0) {
      const excludedFields = ["page", "sort", "limit", "fields"];
      excludedFields.forEach((el) => delete transformedQuery[el]);
      count = await Unit.find(filter).find(transformedQuery).countDocuments();
    } else {
      count = await Unit.countDocuments(filter);
    }

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
