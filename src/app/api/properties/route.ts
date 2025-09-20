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

    const properties = await Property.find({
      business: businessId,
      isActive: true,
    })
      .select("_id name type address isActive code")
      .lean();

    return NextResponse.json({ status: "success", data: properties });
  } catch (error) {
    return NextResponse.json(
      { error: ApiErrorHandler.parse(error) },
      { status: 400 }
    );
  }
}
