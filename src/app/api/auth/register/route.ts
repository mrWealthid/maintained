import { connect } from "@/dbConfig/dbConfig";
import User, { UserDoc } from "@/models/userModel";
import Business from "@/models/businessModel";
import { NextResponse } from "next/server";
import jwt, { SignOptions } from "jsonwebtoken";
import { INVITE_STATUS, ROLES } from "@/app/shared/enums/enums";

connect();

const signToken = (
  id: string,
  tenants: Array<{ business: string; role: ROLES; status: INVITE_STATUS }>
) => {
  return jwt.sign(
    {
      id: id,
      role: tenants[0].role || "USER",
      tenants,
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN } as SignOptions
  );
};

const createSendToken = (
  user: UserDoc,
  statusCode: number,
  tenants: Array<{ business: string; role: ROLES; status: INVITE_STATUS }>
) => {
  const token = signToken(user.id, tenants);

  //Remove password from output
  delete (user as any).password;
  const response = NextResponse.json(
    {
      status: "success",
      token,
      data: {
        user,
      },
    },
    { status: statusCode }
  );
  const timeInMs = Number(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 1000; // 2 minutes in milliseconds
  const expires = new Date(Date.now() + timeInMs);
  response.cookies.set("token", token, {
    httpOnly: true,
    expires,
  });

  return response;
};

export async function POST(request: Request) {
  try {
    const req = await request.json();
    console.log("Incoming Request:", req);

    // Check user existence
    const existingUser = await User.findOne({ email: req.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      );
    }

    const business = await Business.create({
      name: req.businessName,
      registrationId: req.registrationId,
      contact: req.businessContact,
      country: req.country,
      address: req.businessAddress,
      email: req.businessEmail,
      creator: req.name,
    });

    console.log(business);
    if (!business) {
      return NextResponse.json(
        { error: "Business could not be created" },
        { status: 404 }
      );
    }

    // Create User
    const newUser = await User.create({
      name: req.name,
      email: req.email,
      password: req.password,
      memberships: [
        {
          business: business.id,
          role: ROLES.admin,
          status: INVITE_STATUS.activated,
        },
      ],
      currentBusiness: business.id,
    });

    const tenants = newUser.tenantsClaim();

    console.log(newUser);

    return createSendToken(newUser, 201, tenants);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Server error occurred" },
      { status: 500 }
    );
  }
}
