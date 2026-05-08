import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import Business from "@/models/businessModel";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import { sendTeamWelcomeEmail } from "@/lib/email/senders/team/sendTeamWelcomeEmail";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { OnboardUserSchema } from "@/app/auth/model/model";
import {
  assertPasswordPolicy,
  getAppPasswordPolicy,
} from "@/lib/security/password-policy";
import { formatWorkspaceRoleLabel } from "@/shared/auth/roles";
import {
  acceptWorkspaceInviteRecord,
  findPendingWorkspaceInviteByRawToken,
  resolveWorkspaceInviteRequiresAccountSetup,
} from "@/lib/tenancy/workspace-invite-access";
import { upsertActiveWorkspaceMembership } from "@/lib/tenancy/provisioning";
import { WORKSPACE_MEMBERSHIP_SOURCE } from "@/lib/tenancy/model";
import { USER_TYPE } from "@/shared/auth/roles";

const getRequestId = (req: NextRequest) =>
  req.headers.get("x-request-id") ?? undefined;

export async function GET(request: NextRequest) {
  try {
    await connect();

    const inviteToken = request.nextUrl.searchParams.get("inviteToken");
    if (!inviteToken) {
      throw ApiError.badRequest("Invite token is required");
    }

    const workspaceInvite = await findPendingWorkspaceInviteByRawToken({
      rawToken: inviteToken,
    })
      .populate({ path: "workspace", select: "name isActive" })
      .populate({
        path: "invitedUser",
        select: "+password",
      })
      .lean<{
        name: string;
        email: string;
        role: string;
        tokenExpiresAt?: Date | null;
        specialties?: string[];
        property?: mongoose.Types.ObjectId | null;
        unit?: mongoose.Types.ObjectId | null;
        workspace?: {
          _id?: mongoose.Types.ObjectId;
          name?: string;
          isActive?: boolean;
        } | null;
        invitedUser?: {
          password?: string | null;
        } | null;
      } | null>();

    if (!workspaceInvite) {
      throw ApiError.badRequest("This invite is invalid or has expired");
    }

    if (
      !workspaceInvite.workspace ||
      workspaceInvite.workspace.isActive === false
    ) {
      throw ApiError.badRequest("This workspace is no longer available");
    }

    return NextResponse.json({
      status: "success",
      data: {
        name: workspaceInvite.name,
        email: workspaceInvite.email,
        role: workspaceInvite.role,
        businessName: workspaceInvite.workspace.name ?? "Business",
        inviteExpiresAt: workspaceInvite.tokenExpiresAt?.toISOString() ?? null,
        requiresAccountSetup: resolveWorkspaceInviteRequiresAccountSetup(
          workspaceInvite.invitedUser,
        ),
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();

    const payload = parseOrThrow(OnboardUserSchema, await request.json());
    const workspaceInvite = await findPendingWorkspaceInviteByRawToken({
      rawToken: payload.inviteToken,
    });

    if (!workspaceInvite) {
      throw ApiError.badRequest("This invite is invalid or has expired");
    }

    const [business, invitedUser] = await Promise.all([
      Business.findById(workspaceInvite.workspace)
        .select("name workspaceType isActive")
        .lean<{
          name?: string;
          workspaceType?: string | null;
          isActive?: boolean;
        } | null>(),
      workspaceInvite.invitedUser
        ? User.findById(workspaceInvite.invitedUser).select(
            "+password name email currentBusiness contact countryCode passwordChangedAt memberships",
          )
        : Promise.resolve(null),
    ]);

    if (!business || business.isActive === false) {
      throw ApiError.badRequest("This workspace is no longer available");
    }

    const acceptedAt = new Date();
    const targetUser =
      invitedUser ??
      new User({
        email: workspaceInvite.email,
      });
    const requiresAccountSetup = resolveWorkspaceInviteRequiresAccountSetup({
      password: invitedUser?.password,
    });

    targetUser.name = workspaceInvite.name;
    targetUser.email = workspaceInvite.email;

    if (requiresAccountSetup) {
      if (!payload.password || !payload.contact || !payload.countryCode) {
        throw ApiError.badRequest(
          "Complete account setup before accepting this invite",
        );
      }

      const passwordPolicy = await getAppPasswordPolicy();
      assertPasswordPolicy(payload.password, passwordPolicy);

      targetUser.password = payload.password;
      targetUser.passwordChangedAt = acceptedAt;
      targetUser.contact = payload.contact;
      targetUser.countryCode = payload.countryCode;
    }

    const workspaceId = workspaceInvite.workspace as mongoose.Types.ObjectId;
    if (!targetUser.currentBusiness) {
      targetUser.currentBusiness = workspaceId;
    }

    if (!targetUser.emailVerifiedAt) {
      targetUser.emailVerifiedAt = acceptedAt;
    }

    if (workspaceInvite.role === USER_TYPE.tenant && workspaceInvite.unit) {
      const unit = await Unit.findOne({
        _id: workspaceInvite.unit,
        business: workspaceId,
      }).select("tenantUser tenantActive");

      if (
        unit?.tenantUser &&
        unit.tenantUser.toString() !==
          (targetUser._id as mongoose.Types.ObjectId).toString()
      ) {
        throw ApiError.badRequest("This unit already has an active tenant");
      }
    }

    await targetUser.save({ validateBeforeSave: false });
    await upsertActiveWorkspaceMembership({
      workspaceId,
      userId: targetUser._id as mongoose.Types.ObjectId,
      role: workspaceInvite.role as never,
      createdBy: workspaceInvite.invitedBy,
      source: WORKSPACE_MEMBERSHIP_SOURCE.invite,
      joinedAt: acceptedAt,
      specialties: workspaceInvite.specialties,
      property: workspaceInvite.property,
      unit: workspaceInvite.unit,
    });

    if (workspaceInvite.role === USER_TYPE.tenant && workspaceInvite.unit) {
      await Unit.findOneAndUpdate(
        {
          _id: workspaceInvite.unit,
          business: workspaceId,
        },
        {
          $set: {
            tenantUser: targetUser._id,
            tenantActive: true,
          },
          $push: {
            tenants: {
              user: targetUser._id,
              start: acceptedAt,
            },
          },
        },
      );
    }

    await acceptWorkspaceInviteRecord({
      inviteId: workspaceInvite._id as mongoose.Types.ObjectId,
      acceptedBy: targetUser._id as mongoose.Types.ObjectId,
      acceptedAt,
    });

    const emailResult = await sendTeamWelcomeEmail({
      request,
      to: targetUser.email,
      attendeeName: targetUser.name,
      workspaceName: business.name ?? "Business",
      workspaceType: business.workspaceType,
      workspaceRole: formatWorkspaceRoleLabel(workspaceInvite.role),
    });

    if (!emailResult.sent && !emailResult.skippedReason) {
      console.error("Failed to send team welcome email", {
        to: targetUser.email,
        reason: emailResult.error,
      });
    }

    return NextResponse.json({
      status: "success",
      message: `Your ${business.name ?? "workspace"} access has been activated`,
      data: {
        userId: targetUser.id,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
