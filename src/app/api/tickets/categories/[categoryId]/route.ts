import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import Category from "@/models/ticketCategoryModel";
import { ROLES } from "@/shared/enums/enums";

connect();

function assertCategoryAdmin(role: string | undefined) {
  if (role !== ROLES.admin && role !== ROLES.super_admin) {
    throw ApiError.forbidden("Admin access required");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    assertCategoryAdmin(verify.role);

    const { name, description, isActive } = await request.json();
    const { categoryId } = await params;

    const category = await Category.findByIdAndUpdate(
      categoryId,
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
    assertCategoryAdmin(verify.role);

    const { categoryId } = await params;

    const category = await Category.findById(categoryId);
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
