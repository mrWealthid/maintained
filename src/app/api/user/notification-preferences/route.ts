import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import User from "@/models/userModel";

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

    const user = await User.findById(verify.id).select(
      "notificationPreferences"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      data: user.notificationPreferences || {
        mode: "SMS",
        smsEnabled: true,
        emailEnabled: false,
        phoneEnabled: false,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();

    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const preferences = await request.json();

    const user = await User.findByIdAndUpdate(
      verify.id,
      { notificationPreferences: preferences },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      message: "Notification preferences updated successfully",
      data: user.notificationPreferences,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
