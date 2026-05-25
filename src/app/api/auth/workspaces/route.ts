import { NextRequest } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { buildAuthSuccessResponse } from "@/lib/auth/issue-auth-session";
import { revokeAuthSession } from "@/lib/auth/session";
import {
  ensureWorkspaceRoleDefinitions,
  resolveWorkspaceRoleDefinitionId,
} from "@/lib/auth/role-definitions";
import { isSuperAdminRole } from "@/lib/auth/roles";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { normalizeTimeZone } from "@/lib/date/timezone-options";
import { defaultBusinessSecuritySettings } from "@/lib/security/business-security";
import { WORKSPACE_MEMBERSHIP_SOURCE } from "@/lib/tenancy/model";
import { upsertActiveWorkspaceMembership } from "@/lib/tenancy/provisioning";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { sendWorkspaceCreatedEmail } from "@/lib/email/senders/workspaces/sendWorkspaceCreatedEmail";
import { ensureDefaultTicketCategories } from "@/lib/tickets/default-categories";
import { ensureDefaultTicketTypes } from "@/lib/tickets/default-ticket-type";
import Business from "@/models/businessModel";
import User, { UserDoc } from "@/models/userModel";
import { CreateWorkspaceSchema } from "@/shared/model/workspace-create.model";
import { WORKSPACE_ROLE } from "@/shared/auth/roles";
import { WORKSPACE_TYPE } from "@/shared/model/workspace.model";

const getRequestId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

const getLegacyTokenPreview = (user: UserDoc) => {
  const tenants = user.tenantsClaim();
  return {
    id: user.id,
    role: tenants[0]?.role,
    tenants,
  };
};

export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;
  let transactionCommitted = false;

  try {
    await connect();

    const verify = await getVerifiedUser(request);
    if (!verify) {
      throw ApiError.unauthorized("Authentication required");
    }

    if (isSuperAdminRole(verify.role)) {
      throw ApiError.forbidden(
        "Platform admins cannot create workspaces from this flow.",
      );
    }

    await Promise.all([
      ensureDefaultTicketCategories(),
      ensureDefaultTicketTypes(),
    ]);

    session = await mongoose.startSession();
    session.startTransaction();

    const payload = parseOrThrow(CreateWorkspaceSchema, await request.json());
    const timezone = normalizeTimeZone(payload.timezone);
    const user = await User.findById(verify.id)
      .select("name email contact countryCode currentBusiness memberships")
      .session(session);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const workspaceType = payload.workspaceType;
    const createdBusinesses = await Business.create(
      [
        {
          name: payload.businessName,
          workspaceType,
          email: payload.businessEmail || user.email,
          contact: payload.businessContact || user.contact || "",
          countryCode: payload.businessCountryCode || user.countryCode || "US",
          timezone,
          addressStructured: payload.addressStructured,
          creator: user._id,
          owner: user._id,
          settings: {
            general: {
              timezone,
              team: {
                allowTeamInvitations:
                  workspaceType !== WORKSPACE_TYPE.INDIVIDUAL,
                defaultRoleForNewMembers: WORKSPACE_ROLE.member,
              },
            },
          },
        },
      ],
      { session },
    );

    const createdBusiness = createdBusinesses[0];
    await ensureWorkspaceRoleDefinitions({
      workspaceId: createdBusiness.id,
      options: { session, createdBy: user._id as mongoose.Types.ObjectId },
    });

    const ownerRoleDefinitionId = await resolveWorkspaceRoleDefinitionId({
      workspaceId: createdBusiness.id,
      role: WORKSPACE_ROLE.owner,
      options: { session, createdBy: user._id as mongoose.Types.ObjectId },
    });

    await upsertActiveWorkspaceMembership({
      session,
      workspaceId: createdBusiness._id as mongoose.Types.ObjectId,
      userId: user._id as mongoose.Types.ObjectId,
      role: WORKSPACE_ROLE.owner as never,
      roleDefinition: ownerRoleDefinitionId as mongoose.Types.ObjectId | null,
      createdBy: user._id as mongoose.Types.ObjectId,
      source: WORKSPACE_MEMBERSHIP_SOURCE.workspace_create,
      joinedAt: new Date(),
    });

    user.currentBusiness = createdBusiness._id as mongoose.Types.ObjectId;
    await user.save({ session, validateBeforeSave: false });

    await session.commitTransaction();
    transactionCommitted = true;

    try {
      const emailResult = await sendWorkspaceCreatedEmail({
        request,
        recipientName: user.name,
        recipientEmail: user.email,
        workspaceName: createdBusiness.name,
        workspaceType,
        workspaceRole: "Owner",
      });

      if (!emailResult.sent && !emailResult.skippedReason) {
        console.error(
          "Workspace created email failed:",
          emailResult.error ?? "unknown error",
        );
      }
    } catch (emailError) {
      console.error(
        "Workspace created email failed:",
        emailError instanceof Error ? emailError.message : "unknown error",
      );
    }

    const response = await buildAuthSuccessResponse({
      request,
      user,
      status: 201,
      maxActiveSessions: defaultBusinessSecuritySettings.maxActiveSessions,
      body: {
        ok: true,
        message: "Workspace created successfully.",
        ...getLegacyTokenPreview(user),
        data: {
          businessId: createdBusiness.id,
        },
      },
    });

    try {
      await revokeAuthSession(verify.sessionId);
    } catch (error) {
      console.error("Failed to revoke previous workspace session:", error);
    }

    return response;
  } catch (error) {
    if (!transactionCommitted && session?.inTransaction()) {
      await session.abortTransaction();
    }
    return errorToNextResponse(error, getRequestId(request));
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
