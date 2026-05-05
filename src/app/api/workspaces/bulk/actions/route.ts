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

const BulkActionSchema = z.object({
  action: z.enum(["activate", "deactivate"]),
  workspaceIds: z.array(z.string().min(1)).min(1),
});

const getRequestId = (req: NextRequest) =>
  req.headers.get("x-request-id");

export async function POST(request: NextRequest) {
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

    const { action, workspaceIds } = parseOrThrow(
      BulkActionSchema,
      await request.json(),
    );
    const targetState = action === "activate";

    const result = await Business.updateMany(
      { _id: { $in: workspaceIds }, active: { $ne: targetState } },
      { active: targetState },
    );

    const successCount = result.modifiedCount ?? 0;
    const skippedCount = workspaceIds.length - successCount;

    return NextResponse.json({
      status: "success",
      data: {
        action,
        requestedCount: workspaceIds.length,
        successCount,
        skippedCount,
        failureCount: 0,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
