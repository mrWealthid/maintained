import { NextResponse } from "next/server";
import Property from "@/models/propertyModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiErrorHandler } from "@/utils/apiError";
import { PROPERTY_TYPES } from "@/app/shared/onboarding-feat/data/data";
import Unit from "@/models/unitModel";

export async function POST(req: Request) {
  try {
    const me = await getUserFromCookies();
    if (!me?.isAdminRole)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const business = me.currentBusiness;
    const body = await req.json();

    // Check if it's bulk creation or single creation
    const isBulk = Array.isArray(body);
    const propertiesData = isBulk ? body : [body];

    if (!business) {
      return NextResponse.json(
        { error: "business is required" },
        { status: 400 }
      );
    }

    // Validate all properties data
    for (const propertyData of propertiesData) {
      const { type, name, address } = propertyData;
      if (!type || !name || !address) {
        return NextResponse.json(
          { error: "type, name, and address are required for each property" },
          { status: 400 }
        );
      }
    }

    // Create all properties
    const createdProperties = [];
    for (const propertyData of propertiesData) {
      const { type, name, address, code, meta } = propertyData;

      const property = await Property.create({
        business,
        type,
        name,
        address,
        code,
        meta,
        isActive: true,
      });

      if (PROPERTY_TYPES[0].includes(property.type)) {
        const defaultUnit = await Unit.create({
          business: property.business,
          property: property._id,
          label: "Home", // or "Main", configurable
        });
        property.defaultUnit = defaultUnit._id;
        await property.save();
      }

      createdProperties.push(property);
    }

    return NextResponse.json(
      {
        status: "success",
        data: isBulk ? createdProperties : createdProperties[0],
        count: createdProperties.length,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: ApiErrorHandler.parse(error) },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const me = await getUserFromCookies();
    if (!me?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const businessId = me.currentBusiness;
    if (!businessId)
      return NextResponse.json(
        { error: "businessId required" },
        { status: 400 }
      );

    // Get query parameters
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const name = url.searchParams.get("name");
    const type = url.searchParams.get("type");
    const city = url.searchParams.get("city");
    const state = url.searchParams.get("state");

    // Build filter object
    const filter: any = {
      business: businessId,
      isActive: true,
    };

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    if (type) {
      filter.type = { $regex: type, $options: "i" };
    }
    if (city) {
      filter["address.city"] = { $regex: city, $options: "i" };
    }
    if (state) {
      filter["address.state"] = { $regex: state, $options: "i" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalRecords = await Property.countDocuments(filter);

    // Get properties with pagination
    const properties = await Property.find(filter)
      .select("_id name type address isActive code createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get units count for each property
    const propertiesWithUnits = await Promise.all(
      properties.map(async (property) => {
        const unitsCount = await Unit.countDocuments({
          property: property._id,
          isActive: true,
        });
        return {
          ...property,
          units: unitsCount,
        };
      })
    );

    return NextResponse.json({
      status: "success",
      data: propertiesWithUnits,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        hasNext: page < Math.ceil(totalRecords / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: ApiErrorHandler.parse(error) },
      { status: 400 }
    );
  }
}
