import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import Category from "@/models/ticketCategoryModel";
import { z } from "zod";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";
import mongoose from "mongoose";

connect();

const categoryUpdateBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKET_CATEGORIES_MANAGE);

    const { name, description, isActive } = parseOrThrow(
      categoryUpdateBodySchema,
      await request.json()
    );
    const { categoryId } = await params;

    const category = await Category.findOneAndUpdate(
      {
        _id: categoryId,
        business: new mongoose.Types.ObjectId(String(verify.currentBusiness)),
        isDefault: { $ne: true },
      },
      { name, description, isActive },
      { new: true },
    );

    if (!category) throw ApiError.notFound("Category not found");

    return NextResponse.json({
      status: "success",
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKET_CATEGORIES_MANAGE);

    const { categoryId } = await params;

    const category = await Category.findOne({
      _id: categoryId,
      business: new mongoose.Types.ObjectId(String(verify.currentBusiness)),
    });
    if (!category) throw ApiError.notFound("Category not found");
    if (category.isDefault) {
      throw ApiError.badRequest("Cannot delete default categories");
    }

    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
