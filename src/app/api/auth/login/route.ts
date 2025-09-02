import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import jwt, { SignOptions } from "jsonwebtoken";
import { INVITE_STATUS, ROLES } from "@/app/shared/enums/enums";
import User, { UserDoc } from "@/models/userModel";

connect();

const signToken = (
  user: UserDoc,
  tenants: Array<{ business: string; role: ROLES; status: INVITE_STATUS }>
) => {
  const tenant = tenants.find(
    (tenant) => user.currentBusiness.toString() === tenant.business
  );

  return jwt.sign(
    {
      id: user.id,
      role: tenant?.role || "USER",
      tenants,
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN } as SignOptions
  );
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    //1) Check if emails and password exists
    if (!email || !password) {
      return NextResponse.json(
        { error: "Please provide email and password" },
        { status: 400 }
      );
    }
    //2) Check if user exists & password is correct after it's hashed
    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return NextResponse.json(
        { error: "Incorrect email or password" },
        { status: 400 }
      );
    }

    //Email configuration

    // const data = await resend.emails.send({
    // 	from: 'support',
    // 	to: user.email,
    // 	subject: 'Password Reset',
    // 	text:
    // 	react:WaitlistEmail({ name: "Bu" })
    // });

    // resend.emails.send({
    // 	from: 'onboarding@resend.dev',
    // 	to: 'wealthiduwe@gmail.com',
    // 	subject: 'Hello World',

    // 	html: '<p>yeaaa</p>'
    // });

    // new Email(user, 'www.test.com').sendMyMail();
    // await new Emails(user, 'www.test.com').sendPasswordReset();
    // console.log(emails);

    //3) If everything is ok, send token to client

    const tenants = user.tenantsClaim();

    const token = signToken(user, tenants);

    const response = NextResponse.json({
      status: "success",
      token,
    });

    const timeInMs = Number(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 1000; // 2 minutes in milliseconds
    const expires = new Date(Date.now() + timeInMs);
    response.cookies.set("token", token, {
      httpOnly: true,
      expires,
    });

    return response;
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
