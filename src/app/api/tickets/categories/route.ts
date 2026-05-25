import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import Category from "@/models/ticketCategoryModel";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { z } from "zod";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { ensureDefaultTicketCategories } from "@/lib/tickets/default-categories";

connect();

const categoryBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
});

const categoryListQuerySchema = z.object({
  name: z.string().trim().optional(),
});

function exactNameRegex(name: string) {
  return new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKET_CATEGORIES_VIEW);
    await ensureDefaultTicketCategories();

    const parsedQuery = parseOrThrow(
      categoryListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    let filter: Record<string, unknown> = {
      isActive: true,
      $or: [
        { business: new mongoose.Types.ObjectId(String(verify.currentBusiness)) },
        { business: null, isDefault: true },
        { business: { $exists: false }, isDefault: true },
      ],
    };

    if (parsedQuery.name) {
      const regex = new RegExp(parsedQuery.name, "i");
      filter = { ...filter, name: { $regex: regex } };
    }

    const categories = await Category.find(filter).sort({
      isDefault: -1,
      name: 1,
    });

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
    await ensureDefaultTicketCategories();

    const { name, description } = parseOrThrow(
      categoryBodySchema,
      await request.json()
    );
    const businessId = new mongoose.Types.ObjectId(verify.currentBusiness);
    const existingCategory = await Category.findOne({
      name: exactNameRegex(name),
      $or: [
        { business: businessId },
        { business: null, isDefault: true },
        { business: { $exists: false }, isDefault: true },
      ],
    }).select("_id");

    if (existingCategory) {
      throw ApiError.badRequest("Category already exists");
    }

    const data = await Category.create({
      name,
      description,
      business: businessId,
      isDefault: false,
      isSystem: false,
      isActive: true,
    });

    return NextResponse.json({ status: "success", data }, { status: 201 });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
