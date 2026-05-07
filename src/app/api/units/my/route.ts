// app/api/units/my/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import Unit from "@/models/unitModel";
import { findActiveWorkspaceMembership } from "@/lib/tenancy/workspace-membership-access";

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    const membership = await findActiveWorkspaceMembership({
      userId: verify.id,
      workspaceId: verify.businessId,
    }).lean<{
      unit?: string | Types.ObjectId;
    } | null>();

    if (!membership) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const unitIds = [
      ...(membership.unit ? [membership.unit] : []),
    ].map((id) => new Types.ObjectId(id));

    if (!unitIds.length) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const units = await Unit.aggregate([
      {
        $match: {
          _id: { $in: unitIds },
          business: new Types.ObjectId(verify.businessId),
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "properties",
          localField: "property",
          foreignField: "_id",
          as: "prop",
        },
      },
      { $unwind: "$prop" },
      {
        $project: { _id: 1, label: 1, property: 1, propertyName: "$prop.name" },
      },
    ]);

    return NextResponse.json({ data: units }, { status: 200 });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
