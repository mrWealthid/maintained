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
    const { type, name, address, code, meta } = await req.json();

    if (!business || !type || !name) {
      return NextResponse.json(
        { error: "business, type, name are required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json(
      { status: "success", data: property },
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
