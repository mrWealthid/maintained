import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import Category from "@/models/ticketCategoryModel";
import { connect } from "@/dbConfig/dbConfig";
import { mapToObject } from "@/utils/helpers";
import User from "@/models/userModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";

connect();

export async function GET(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    const transformedQuery = mapToObject(
      request.nextUrl.searchParams as unknown as Map<string, string>,
    );

    const businessIds = user.memberships.map((m) =>
      typeof m.business === "object" ? m.business._id : m.business,
    );

    let filter: Record<string, unknown> = {
      $or: [{ business: { $in: businessIds } }, { isDefault: true }],
    };

    if (transformedQuery.name) {
      const regex = new RegExp(String(transformedQuery.name), "i");
      filter = { ...filter, name: { $regex: regex } };
      delete transformedQuery.name;
    }

    const categories = await Category.find(filter);

    return NextResponse.json({ status: "success", data: categories });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function POST(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    const { name, description } = await request.json();

    const data = await Category.create({
      name,
      description,
      business: new mongoose.Types.ObjectId(verify.currentBusiness),
      isDefault: false,
    });

    return NextResponse.json({ status: "success", data }, { status: 201 });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
