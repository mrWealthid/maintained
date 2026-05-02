import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import User from "@/models/userModel";

connect();

const notificationPreferencesSchema = z.object({
  ticketCreatedAlerts: z.boolean().default(true),
  ticketStatusAlerts: z.boolean().default(true),
  ticketAssignmentAlerts: z.boolean().default(true),
  technicianRequestAlerts: z.boolean().default(true),
  tenantMessageAlerts: z.boolean().default(true),
  commentAlerts: z.boolean().default(true),
  emailFrequency: z
    .enum(["immediate", "hourly", "daily", "weekly", "off"])
    .default("immediate"),
  smsPreference: z.enum(["all", "urgent", "off"]).default("urgent"),
  pushPreference: z.enum(["all", "important", "off"]).default("important"),
  mode: z.enum(["SMS", "EMAIL", "PHONE"]).optional(),
  smsEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  phoneEnabled: z.boolean().optional(),
});

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    const user = await User.findById(verify.id).select(
      "notificationPreferences"
    );
    if (!user) throw ApiError.notFound("User not found");

    return NextResponse.json({
      status: "success",
      data:
        user.notificationPreferences ||
        notificationPreferencesSchema.parse({}),
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function PUT(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    const preferences = parseOrThrow(
      notificationPreferencesSchema,
      await request.json()
    );

    const user = await User.findByIdAndUpdate(
      verify.id,
      { notificationPreferences: preferences },
      { new: true }
    );

    if (!user) throw ApiError.notFound("User not found");

    return NextResponse.json({
      status: "success",
      message: "Notification preferences updated successfully",
      data: user.notificationPreferences,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
