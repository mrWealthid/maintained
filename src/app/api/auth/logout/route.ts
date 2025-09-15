import { ApiErrorHandler } from "@/utils/apiError";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookie = await cookies();
    cookie.delete("token");
    const response = NextResponse.json({
      status: "success",
      message: "User was logged out",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: ApiErrorHandler.parse(error) },
      { status: 500 }
    );
  }
}
