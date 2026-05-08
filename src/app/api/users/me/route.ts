import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

connect();

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

const updatePersonalInfoSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  contact: z.string().trim().max(40).optional().default(""),
  countryCode: z.string().trim().max(4).optional().default(""),
});

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

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

    if (!user) throw ApiError.notFound("User not found");

    return NextResponse.json(
      {
        status: "success",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function PUT(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    const payload = parseOrThrow(updatePersonalInfoSchema, await request.json());
    const user = await User.findByIdAndUpdate(
      verify.id,
      {
        name: payload.name,
        contact: payload.contact,
        countryCode: payload.countryCode,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("name email contact countryCode photo");

    if (!user) throw ApiError.notFound("User not found");

    return NextResponse.json({
      status: "success",
      message: "Personal information updated successfully",
      data: user,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
