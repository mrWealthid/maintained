import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function PATCH(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();

    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { currentBusiness } = await request.json();

    console.log({ currentBusiness });

    const updatedCurrentBusiness = await User.findByIdAndUpdate(
      verify.id,
      { currentBusiness },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    if (!updatedCurrentBusiness)
      NextResponse.json({ error: "User not found" }, { status: 404 });

    const response = NextResponse.json(
      {
        status: "success",
        data: updatedCurrentBusiness,
      },
      { status: 200 }
    );

    // httpOnly so client JS can’t tamper; shortish max-age; secure + samesite for safety
    response.cookies.set("activeBusiness", String(currentBusiness), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days; adjust as needed
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
