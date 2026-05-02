import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connect();

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    const user = await User.findById(verify.id).populate([
      {
        path: "currentBusiness",
        select: "name logo",
      },
      {
        path: "memberships.business",
        select: "name",
      },
    ]);

    if (!user) throw ApiError.notFound("User not found");

    return NextResponse.json(
      {
        status: "success",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
