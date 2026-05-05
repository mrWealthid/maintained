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
import Business from "@/models/businessModel";

const StatusPatchSchema = z.object({
  isActive: z.boolean(),
});

const getRequestId = (req: NextRequest) =>
  req.headers.get("x-request-id");

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertPermission(
      {
        userId: verify.id,
        businessId: verify.businessId,
        platformRole: verify.platformRole,
        workspaceRole: verify.workspaceRole,
      },
      PERMISSION.PLATFORM_WORKSPACES_STATUS_MANAGE,
    );

    const { id } = await params;
    const { isActive } = parseOrThrow(StatusPatchSchema, await request.json());

    const business = await Business.findByIdAndUpdate(
      id,
      { active: isActive },
      { new: true },
    );

    if (!business) {
      throw ApiError.notFound("Workspace not found");
    }

    return NextResponse.json({
      status: "success",
      data: { id, isActive: business.active ?? isActive },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
