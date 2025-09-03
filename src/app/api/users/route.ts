import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import APIFeatures from "@/utils/apiFeatures";
import { mapToObject } from "@/utils/helpers";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import mongoose from "mongoose";

connect();

export async function GET(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (verify.isUserRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentBusinessId = new mongoose.Types.ObjectId(
      verify.currentBusiness
    );

    // Base filter: must have a membership for the current business
    let filter: any = { "memberships.business": currentBusinessId };

    const query = request.nextUrl.searchParams;
    const transformedQuery = mapToObject(query as any);

    // Exclude current user
    if (query.get("excludeSelf") === "true") {
      filter._id = { $ne: verify.id };
      delete transformedQuery.excludeSelf;
    }

    // Name (partial)
    if (transformedQuery.name) {
      filter.name = { $regex: new RegExp(transformedQuery.name, "i") };
      delete transformedQuery.name;
    }

    // Build one $elemMatch for memberships so we don't overwrite previous filters
    const elemMatch: any = { business: currentBusinessId };

    // If 'status' is provided, it takes precedence over excludeInactive
    if (transformedQuery.status) {
      elemMatch.status = transformedQuery.status;
      delete transformedQuery.status;
    } else if (query.get("excludeInactive") === "true") {
      // Only active per business
      elemMatch.status = "ACTIVATED";
      // remove the flag from query map so it doesn't leak into APIFeatures
      delete (transformedQuery as any).excludeInactive;
    }

    if (transformedQuery.role) {
      elemMatch.role = transformedQuery.role;
      delete transformedQuery.role;
    }

    // Apply the $elemMatch only if we added any qualifiers beyond 'business'
    if (Object.keys(elemMatch).length > 1) {
      filter.memberships = { $elemMatch: elemMatch };
    }

    // Query + features
    const userQuery = User.find(filter);
    const features = new APIFeatures(userQuery, transformedQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate([
        { path: "currentBusiness", select: "businessName country" },
        { path: "memberships.business", select: "businessName" },
      ]);

    const users = await features.query;

    // Count for pagination with same filters
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((f) => delete transformedQuery[f]);
    const count = await User.find(filter)
      .find(transformedQuery)
      .countDocuments();

    return NextResponse.json({
      status: "success",
      totalRecords: count,
      results: users.length,
      data: users,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
