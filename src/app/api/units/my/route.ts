// app/api/units/my/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { INVITE_STATUS } from "@/shared/enums/enums";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    const user = await User.findById(verify.id)
      .select("memberships")
      .lean<{
        memberships?: Array<{
          business?: { toString(): string } | string;
          status?: string;
          unit?: string | Types.ObjectId;
          accessibleUnits?: Array<string | Types.ObjectId>;
        }>;
      } | null>();
    const membership = user?.memberships?.find(
      (item) =>
        String(item.business) === String(verify.businessId) &&
        item.status === INVITE_STATUS.activated
    );

    if (!membership) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const unitIds = [
      ...(membership.unit ? [membership.unit] : []),
      ...(membership.accessibleUnits || []),
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
