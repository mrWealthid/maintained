import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { errorToNextResponse } from "@/lib/errors/apiError";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const verifiedUser = await getUserFromCookies(request);

    if (!verifiedUser) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized",
          user: null,
        },
        { status: 401 }
      );
    }

    const user = await User.findById(verifiedUser.id).lean();
    const data = user
      ? {
          ...user,
          role: verifiedUser.role ?? null,
          businessName: verifiedUser.currentBusinessName ?? undefined,
        }
      : null;

    return NextResponse.json({
      status: "success",
      data,
      user: data,
    });
  } catch (error) {
    return errorToNextResponse(
      error,
      request.headers.get("x-request-id") ?? undefined
    );
  }
}
