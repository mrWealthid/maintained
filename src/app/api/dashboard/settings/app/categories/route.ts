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

const categoryBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
});

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

    // Platform-wide defaults: categories not bound to any business.
    const categories = await Category.find({
      $or: [{ business: null }, { business: { $exists: false } }],
    });

    return NextResponse.json({ status: "success", data: categories });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    await requirePlatformSettings(request, PERMISSION.PLATFORM_SETTINGS_MANAGE);

    const { name, description } = parseOrThrow(
      categoryBodySchema,
      await request.json(),
    );

    const data = await Category.create({
      name,
      description,
      business: null,
      isDefault: true,
    });

    return NextResponse.json({ status: "success", data }, { status: 201 });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
