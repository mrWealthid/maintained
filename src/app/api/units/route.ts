// app/api/units/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import {
  unitFormSchema,
  unitListQuerySchema,
} from "@/features/units/models/unit-form.model";
import { PERMISSION } from "@/shared/auth/permission-registry";
import APIFeatures from "@/utils/apiFeatures";
import Unit from "@/models/unitModel";
import Property from "@/models/propertyModel";
import { Unit as IUnit } from "@/features/units/services/unit-service";

const unitCreateBodySchema = unitFormSchema
  .omit({ isActive: true })
  .partial({ property: true })
  .refine((body) => Boolean(body.propertyId ?? body.property), {
    path: ["property"],
    message: "Property is required",
  })
  .transform((body) => ({
    ...body,
    property: body.propertyId ?? body.property,
  }));

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.UNITS_VIEW);
    const parsedQuery = parseOrThrow(
      unitListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    const filter: Record<string, unknown> = {
      business: verify.businessId,
      isActive: parsedQuery.isActive ?? true,
    };
    const transformedQuery: Record<string, unknown> = { ...parsedQuery };

    if (parsedQuery.propertyId ?? parsedQuery.property) {
      filter.property = parsedQuery.propertyId ?? parsedQuery.property;
      delete transformedQuery.propertyId;
      delete transformedQuery.property;
    }

    if (parsedQuery.label) {
      filter.label = { $regex: parsedQuery.label, $options: "i" };
      delete transformedQuery.label;
    }

    if (parsedQuery.tenant) {
      filter["tenantUser.name"] = {
        $regex: parsedQuery.tenant,
        $options: "i",
      };
      delete transformedQuery.tenant;
    }
    delete transformedQuery.search;

    const features = new APIFeatures(Unit.find(filter), transformedQuery)
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
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function POST(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.UNITS_CREATE);
    const body = parseOrThrow(unitCreateBodySchema, await request.json());

    const property = await Property.findOne({
      _id: body.property,
      business: verify.businessId,
      isActive: true,
    }).select("_id");

    if (!property) {
      throw ApiError.notFound("Property not found");
    }

    const unit = await Unit.create({
      business: verify.businessId,
      property: body.property,
      label: body.label,
      floor: body.floor,
      tags: body.tags,
      isActive: true,
    });

    return NextResponse.json(
      { status: "success", data: unit },
      { status: 201 }
    );
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
