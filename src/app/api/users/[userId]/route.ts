import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import User from "@/models/userModel";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { NextRequest, NextResponse } from "next/server";

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.TEAM_REMOVE);
    const { userId } = await params;

    if (userId === verify.id) {
      throw ApiError.badRequest("You cannot remove yourself from the workspace");
    }

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        "memberships.business": verify.businessId,
      },
      {
        $pull: {
          memberships: { business: verify.businessId },
        },
      },
      { new: true }
    );

    if (!user) {
      throw ApiError.notFound("No user found with id");
    }

    return NextResponse.json({
      message: "User removed from workspace successfully",
      success: true,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
