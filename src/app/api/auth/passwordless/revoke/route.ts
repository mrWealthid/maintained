import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { errorToNextResponse } from "@/lib/errors/apiError";
import {
  hashPasswordlessLoginToken,
  PASSWORDLESS_LOGIN_QUERY_PARAM,
} from "@/lib/auth/passwordless";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const token = request.nextUrl.searchParams.get(
      PASSWORDLESS_LOGIN_QUERY_PARAM.TOKEN
    );

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/passwordless/link-revoked", request.url)
      );
    }

    await User.updateOne(
      { passwordlessLoginToken: hashPasswordlessLoginToken(token) },
      {
        $unset: {
          passwordlessLoginToken: 1,
          passwordlessLoginExpires: 1,
        },
      }
    );

    return NextResponse.redirect(
      new URL("/auth/passwordless/link-revoked", request.url)
    );
  } catch (error) {
    return errorToNextResponse(error);
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
