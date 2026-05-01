import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import User, { IUser } from "@/models/userModel";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { teamListQuerySchema } from "@/features/team/models/team-form.model";
import APIFeatures from "@/utils/apiFeatures";
import { mapToObject } from "@/utils/helpers";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

connect();

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.TEAM_VIEW);
    const parsedQuery = parseOrThrow(
      teamListQuerySchema.extend({
        name: teamListQuerySchema.shape.search.optional(),
        excludeSelf: teamListQuerySchema.shape.search.optional(),
        excludeInactive: teamListQuerySchema.shape.search.optional(),
      }),
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    const currentBusinessId = new mongoose.Types.ObjectId(verify.businessId);
    const filter: Record<string, unknown> = {
      "memberships.business": currentBusinessId,
    };

    const transformedQuery = mapToObject(request.nextUrl.searchParams as any);

    if (request.nextUrl.searchParams.get("excludeSelf") === "true") {
      filter._id = { $ne: verify.id };
      delete transformedQuery.excludeSelf;
    }

    const searchName = parsedQuery.name ?? parsedQuery.search;
    if (searchName) {
      filter.name = { $regex: new RegExp(searchName, "i") };
      delete transformedQuery.name;
      delete transformedQuery.search;
    }

    const elemMatch: Record<string, unknown> = { business: currentBusinessId };

    if (parsedQuery.status) {
      elemMatch.status = parsedQuery.status;
      delete transformedQuery.status;
    } else if (request.nextUrl.searchParams.get("excludeInactive") === "true") {
      elemMatch.status = "ACTIVATED";
      delete transformedQuery.excludeInactive;
    }

    if (parsedQuery.role) {
      elemMatch.role = parsedQuery.role;
      delete transformedQuery.role;
    }

    if (Object.keys(elemMatch).length > 1) {
      filter.memberships = { $elemMatch: elemMatch };
    }

    const features = new APIFeatures(User.find(filter), transformedQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate([
        { path: "currentBusiness", select: "name country" },
        { path: "memberships.business", select: "name" },
      ]);

    const users = await features.query;
    const countFeatures = new APIFeatures<IUser>(
      User.find(filter),
      transformedQuery
    ).filter();
    const count = await countFeatures.query.countDocuments();

    return NextResponse.json({
      status: "success",
      totalRecords: count,
      results: users.length,
      data: users,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
