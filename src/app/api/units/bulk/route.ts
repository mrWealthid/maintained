// app/api/units/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { PERMISSION } from "@/shared/auth/permission-registry";
import Property from "@/models/propertyModel";
import Unit from "@/models/unitModel";

const BodySchema = z.object({
  properties: z
    .array(
      z.object({
        propertyId: z.string().min(1),
        unitIds: z.array(z.string()).default([]),
        newUnitLabels: z.array(z.string().min(1)).default([]),
      })
    )
    .min(1, "properties must have at least one item"),
});

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");
const toKey = (value: string) => normalize(value).toLowerCase();

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function POST(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.UNITS_CREATE);
    const { properties } = parseOrThrow(BodySchema, await request.json());

    const propertyIds = properties.map((group) => group.propertyId);
    const ownedProperties = await Property.find({
      _id: { $in: propertyIds },
      business: verify.businessId,
      isActive: true,
    }).select("_id");
    const ownedPropertyIds = new Set(
      ownedProperties.map((property) => String(property._id))
    );

    const results: Array<{
      propertyId: string;
      createdUnits: Array<{ _id: string; label: string }>;
      skippedLabels: string[];
      validatedSelectedUnitIds: string[];
      invalidSelectedUnitIds: string[];
      totalUnitsAfter: number;
    }> = [];

    for (const group of properties) {
      const { propertyId, unitIds = [], newUnitLabels = [] } = group;

      if (!ownedPropertyIds.has(propertyId)) {
        throw ApiError.notFound("Property not found");
      }

      let validatedSelectedUnitIds: string[] = [];
      let invalidSelectedUnitIds: string[] = [];

      if (unitIds.length) {
        const found = await Unit.find({
          _id: { $in: unitIds },
          business: verify.businessId,
          property: propertyId,
        }).select("_id");

        const validSet = new Set(found.map((unit) => String(unit._id)));
        validatedSelectedUnitIds = unitIds.filter((id) =>
          validSet.has(String(id))
        );
        invalidSelectedUnitIds = unitIds.filter(
          (id) => !validSet.has(String(id))
        );
      }

      let createdUnits: Array<{ _id: string; label: string }> = [];
      const skippedLabels: string[] = [];

      if (newUnitLabels.length) {
        const existing = await Unit.find({
          business: verify.businessId,
          property: propertyId,
        }).select("label");

        const existingKeys = new Set(existing.map((unit) => toKey(unit.label)));
        const incoming = Array.from(
          new Set(newUnitLabels.map((label) => normalize(label)).filter(Boolean))
        );

        const toCreate = [];
        for (const label of incoming) {
          const key = toKey(label);
          if (existingKeys.has(key)) {
            skippedLabels.push(label);
            continue;
          }
          toCreate.push({
            business: verify.businessId,
            property: propertyId,
            label,
            isActive: true,
          });
          existingKeys.add(key);
        }

        if (toCreate.length) {
          const inserted = await Unit.insertMany(toCreate, { ordered: false });
          createdUnits = inserted.map((unit) => ({
            _id: String(unit._id),
            label: unit.label,
          }));
        }
      }

      const totalUnitsAfter = await Unit.countDocuments({
        business: verify.businessId,
        property: propertyId,
      });

      results.push({
        propertyId,
        createdUnits,
        skippedLabels,
        validatedSelectedUnitIds,
        invalidSelectedUnitIds,
        totalUnitsAfter,
      });
    }

    return NextResponse.json(
      { status: "success", data: results },
      { status: 201 }
    );
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
