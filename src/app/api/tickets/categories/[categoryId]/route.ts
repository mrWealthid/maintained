import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import Category from "@/models/ticketCategoryModel";
import { ROLES } from "@/app/shared/enums/enums";

connect();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const verify = await getUserFromCookies();

    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (verify.role !== ROLES.admin && verify.role !== ROLES.super_admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { name, description, isActive } = await request.json();
    const { categoryId } = await params;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, description, isActive },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Category updated successfully",
      data: category,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
