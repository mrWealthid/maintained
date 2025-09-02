import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import MiddlewareFeatures from "@/middlewareFeatures";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();

    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

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

    if (!user) NextResponse.json({ error: "User not found" }, { status: 404 });

    const response = NextResponse.json(
      {
        status: "success",
        data: user,
      },
      { status: 200 }
    );
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
