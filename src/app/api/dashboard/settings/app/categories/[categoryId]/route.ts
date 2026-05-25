import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertPermission } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { PERMISSION } from "@/shared/auth/permission-registry";
import Category from "@/models/ticketCategoryModel";

const categoryUpdateBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

async function requirePlatformManage(request: NextRequest) {
  const verify = await getVerifiedUser(request);
  if (!verify) throw ApiError.unauthorized();
  await assertPermission(
    {
      userId: verify.id,
      businessId: verify.businessId,
      platformRole: verify.platformRole,
      workspaceRole: verify.workspaceRole,
    },
    PERMISSION.PLATFORM_SETTINGS_MANAGE,
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    await connect();
    await requirePlatformManage(request);

    const { name, description, isActive } = parseOrThrow(
      categoryUpdateBodySchema,
      await request.json(),
    );
    const { categoryId } = await params;

    const existing = await Category.findById(categoryId);
    if (!existing) throw ApiError.notFound("Category not found");
    if (existing.business) {
      throw ApiError.badRequest("Not a platform-wide category");
    }
    if (existing.isSystem) {
      throw ApiError.badRequest("System categories cannot be modified");
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, description, isActive },
      { new: true },
    );

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
    await connect();
    await requirePlatformManage(request);

    const { categoryId } = await params;

    const category = await Category.findById(categoryId);
    if (!category) throw ApiError.notFound("Category not found");
    if (category.business) {
      throw ApiError.badRequest("Not a platform-wide category");
    }
    if (category.isSystem) {
      throw ApiError.badRequest("System categories cannot be deleted");
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
