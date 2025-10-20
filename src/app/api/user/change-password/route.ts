import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";

connect();

export async function POST(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();

    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, passcode } = await request.json();

    if (!currentPassword || !newPassword || !passcode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (passcode.length !== 6) {
      return NextResponse.json(
        { error: "Passcode must be 6 digits" },
        { status: 400 }
      );
    }

    const user = await User.findById(verify.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // TODO: Verify passcode (implement SMS/email verification)
    // For now, we'll just check if it's a 6-digit number
    if (!/^\d{6}$/.test(passcode)) {
      return NextResponse.json(
        { error: "Invalid passcode format" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.findByIdAndUpdate(verify.id, { password: hashedNewPassword });

    return NextResponse.json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
