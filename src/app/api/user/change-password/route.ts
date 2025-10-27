import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Emails } from "@/utils/email-resend";

connect();

// Step 1: Initiate password change - validate passwords and send passcode
export async function POST(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();

    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    if (!verify.currentBusiness) {
      return NextResponse.json(
        { error: "No current business context" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current and new passwords are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const user = await User.findById(verify.id).select("+password");

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

    // Generate and store passcode
    const passcode = user.createPasswordChangePasscode();
    await user.save({ validateBeforeSave: false });

    // // Send passcode via email
    try {
      await new Emails(user, verify.currentBusiness).sendPasswordChangePasscode(
        passcode
      );
    } catch (emailError) {
      console.error("Error sending passcode email:", emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({
      status: "success",
      message: "Verification passcode sent to your email",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Step 2: Verify passcode and complete password change
export async function PUT(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();

    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { passcode, newPassword } = await request.json();

    if (!passcode || !newPassword) {
      return NextResponse.json(
        { error: "Passcode and new password are required" },
        { status: 400 }
      );
    }

    if (passcode.length !== 6 || !/^\d{6}$/.test(passcode)) {
      return NextResponse.json(
        { error: "Passcode must be 6 digits" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const user = await User.findById(verify.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify passcode
    if (!user.passwordChangePasscode || !user.passwordChangePasscodeExpires) {
      return NextResponse.json(
        { error: "No active passcode found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if passcode has expired
    const now = new Date();
    if (now > user.passwordChangePasscodeExpires) {
      return NextResponse.json(
        { error: "Passcode has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify the passcode
    const hashedPasscode = crypto
      .createHash("sha256")
      .update(passcode)
      .digest("hex");

    const isPasscodeValid = hashedPasscode === user.passwordChangePasscode;

    if (!isPasscodeValid) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear passcode
    await User.findByIdAndUpdate(verify.id, {
      password: hashedNewPassword,
      passwordChangePasscode: undefined,
      passwordChangePasscodeExpires: undefined,
      passwordChangedAt: new Date(),
    });

    return NextResponse.json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
