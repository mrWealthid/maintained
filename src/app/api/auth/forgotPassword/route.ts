import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import jwt, { SignOptions } from "jsonwebtoken";
import { Emails } from "@/utils/email-resend";

connect();

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
  } as SignOptions);

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  try {
    //1) Check if emails and password exists
    if (!email) {
      return NextResponse.json(
        { error: "Please provide an email" },
        { status: 400 }
      );
    }
    //2) Check if user exists & password is correct after it's hashed
    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 400 }
      );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    let resetURL =
      process.env.NODE_ENV === "development"
        ? `http://localhost:3000/auth/updatePassword/${resetToken}`
        : `https://hotel-app-blush-beta.vercel.app/auth/updatePassword/${resetToken}`;

    await new Emails(user, resetURL).sendPasswordReset();

    //3) If everything is ok, send token to client

    const token = signToken(user.id);
    const response = NextResponse.json({
      status: "success",
      message: "Token sent to email",
    });

    const timeInMs = Number(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 1000; // 2 minutes in milliseconds
    const expires = new Date(Date.now() + timeInMs);
    response.cookies.set("token", token, {
      httpOnly: true,
      expires,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
