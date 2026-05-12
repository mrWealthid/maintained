import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import { buildAuthSuccessResponse } from "@/lib/auth/issue-auth-session";
import { revokeAuthSession } from "@/lib/auth/session";
import { isSuperAdminRole } from "@/lib/auth/roles";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { defaultBusinessSecuritySettings } from "@/lib/security/business-security";
import { findActiveWorkspaceMembership } from "@/lib/tenancy/workspace-membership-access";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import User from "@/models/userModel";

const SwitchWorkspaceSchema = z.object({
  businessId: z
    .string()
    .min(1, "businessId is required")
    .refine((value) => mongoose.Types.ObjectId.isValid(value), {
      message: "Invalid businessId",
    }),
});

const getRequestId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

export async function POST(request: NextRequest) {
  try {
    await connect();

    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    if (isSuperAdminRole(verify.role)) {
      throw ApiError.forbidden(
        "Platform admins do not switch workspaces from this flow.",
      );
    }

    const { businessId } = parseOrThrow(
      SwitchWorkspaceSchema,
      await request.json(),
    );

    if (verify.businessId === businessId) {
      return Response.json({
        ok: true,
        message: "Already in this workspace.",
        data: { businessId },
      });
    }

    const membership = await findActiveWorkspaceMembership({
      userId: verify.id,
      workspaceId: businessId,
    }).lean<{ role?: string | null } | null>();

    if (!membership?.role) {
      throw ApiError.forbidden("You do not have access to this workspace.");
    }

    const user = await User.findById(verify.id).select(
      "name email contact countryCode currentBusiness memberships",
    );
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    user.currentBusiness = new mongoose.Types.ObjectId(businessId);
    await user.save({ validateBeforeSave: false });

    const response = await buildAuthSuccessResponse({
      request,
      user,
      maxActiveSessions: defaultBusinessSecuritySettings.maxActiveSessions,
      body: {
        ok: true,
        message: "Workspace switched.",
        data: { businessId },
      },
    });

    try {
      await revokeAuthSession(verify.sessionId);
    } catch (error) {
      console.error("Failed to revoke previous workspace session:", error);
    }

    return response;
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
