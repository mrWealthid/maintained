import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import {
  propertyFormSchema,
  propertyListQuerySchema,
} from "@/features/properties/models/property-form.model";
import { PERMISSION } from "@/shared/auth/permission-registry";
import APIFeatures from "@/utils/apiFeatures";
import Property from "@/models/propertyModel";
import Unit from "@/models/unitModel";
import { Property as IProperty } from "@/features/properties/services/property-service";

const propertyCreateBodySchema = propertyFormSchema
  .omit({ isActive: true })
  .extend({
    meta: z.unknown().optional(),
  });

const propertyBulkCreateBodySchema = propertyCreateBodySchema.or(
  propertyCreateBodySchema.array().min(1)
);

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function POST(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.PROPERTIES_CREATE);
    const body = parseOrThrow(
      propertyBulkCreateBodySchema,
      await request.json()
    );
    const propertiesData = Array.isArray(body) ? body : [body];

    const createdProperties = [];
    for (const propertyData of propertiesData) {
      const property = await Property.create({
        business: verify.businessId,
        type: propertyData.type,
        name: propertyData.name,
        address: propertyData.address,
        code: propertyData.code,
        meta: propertyData.meta,
        isActive: true,
      });

      if (property.type === "HOUSE") {
        const defaultUnit = await Unit.create({
          business: property.business,
          property: property._id,
          label: "Main",
        });
        property.defaultUnit = defaultUnit._id;
        await property.save();
      }

      createdProperties.push(property);
    }

    return NextResponse.json(
      {
        status: "success",
        data: Array.isArray(body) ? createdProperties : createdProperties[0],
        count: createdProperties.length,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.PROPERTIES_VIEW);
    const parsedQuery = parseOrThrow(
      propertyListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    const filter: Record<string, unknown> = {
      business: verify.businessId,
      isActive: parsedQuery.isActive ?? true,
    };

    const transformedQuery: Record<string, unknown> = { ...parsedQuery };

    if (parsedQuery.name) {
      filter.name = { $regex: parsedQuery.name, $options: "i" };
      delete transformedQuery.name;
    }
    if (parsedQuery.type) {
      filter.type = { $regex: parsedQuery.type, $options: "i" };
      delete transformedQuery.type;
    }
    if (parsedQuery.city) {
      filter["address.city"] = { $regex: parsedQuery.city, $options: "i" };
      delete transformedQuery.city;
    }
    if (parsedQuery.state) {
      filter["address.state"] = { $regex: parsedQuery.state, $options: "i" };
      delete transformedQuery.state;
    }
    delete transformedQuery.search;

    const features = new APIFeatures(Property.find(filter), transformedQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const properties = await features.query;
    const countFeatures = new APIFeatures<IProperty>(
      Property.find(filter),
      transformedQuery
    ).filter();
    const count = await countFeatures.query.countDocuments();

    return NextResponse.json(
      {
        totalRecords: count,
        results: properties.length,
        status: "success",
        data: properties,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
