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
import { ensureDefaultTicketCategories } from "@/lib/tickets/default-categories";

const categoryBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
});

function exactNameRegex(name: string) {
  return new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

async function requirePlatformSettings(
  request: NextRequest,
  permission:
    | typeof PERMISSION.PLATFORM_SETTINGS_VIEW
    | typeof PERMISSION.PLATFORM_SETTINGS_MANAGE,
) {
  const verify = await getVerifiedUser(request);
  if (!verify) throw ApiError.unauthorized();
  await assertPermission(
    {
      userId: verify.id,
      businessId: verify.businessId,
      platformRole: verify.platformRole,
      workspaceRole: verify.workspaceRole,
    },
    permission,
  );
  return verify;
}

export async function GET(request: NextRequest) {
  try {
    await connect();
    await requirePlatformSettings(request, PERMISSION.PLATFORM_SETTINGS_VIEW);
    await ensureDefaultTicketCategories();

    // Platform-wide defaults: categories not bound to any business.
    const categories = await Category.find({
      $or: [{ business: null }, { business: { $exists: false } }],
    }).sort({ isSystem: -1, name: 1 });

    return NextResponse.json({ status: "success", data: categories });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    await requirePlatformSettings(request, PERMISSION.PLATFORM_SETTINGS_MANAGE);
    await ensureDefaultTicketCategories();

    const { name, description } = parseOrThrow(
      categoryBodySchema,
      await request.json(),
    );
    const existingCategory = await Category.findOne({
      name: exactNameRegex(name),
      $or: [{ business: null }, { business: { $exists: false } }],
    }).select("_id");

    if (existingCategory) {
      throw ApiError.badRequest("Platform category already exists");
    }

    const data = await Category.create({
      name,
      description,
      business: null,
      isDefault: true,
      isSystem: false,
      isActive: true,
    });

    return NextResponse.json({ status: "success", data }, { status: 201 });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
