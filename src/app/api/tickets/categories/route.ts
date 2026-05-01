import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import Category from "@/models/ticketCategoryModel";
import { connect } from "@/dbConfig/dbConfig";
import { mapToObject } from "@/utils/helpers";
import User from "@/models/userModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { z } from "zod";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

connect();

const categoryBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
});

export async function GET(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKET_CATEGORIES_VIEW);

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
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKET_CATEGORIES_MANAGE);

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    const { name, description } = parseOrThrow(
      categoryBodySchema,
      await request.json()
    );

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
