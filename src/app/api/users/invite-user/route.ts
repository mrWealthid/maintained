import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import WorkspaceInvite from "@/models/workspaceInviteModel";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { sendTeamInviteEmail } from "@/lib/email/senders/team/sendTeamInviteEmail";
import {
  generateWorkspaceInviteToken,
  upsertPendingWorkspaceInvite,
} from "@/lib/tenancy/invites";
import { WORKSPACE_INVITE_STATUS } from "@/lib/tenancy/model";
import { findWorkspaceMembershipByUser } from "@/lib/tenancy/workspace-membership-access";
import { MEMBERSHIP_STATUS, USER_TYPE } from "@/shared/auth/roles";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const inviteUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email().toLowerCase(),
  role: z.string().trim().min(1),
  dateOfBirth: z.string().optional(),
  specialties: z.array(z.string()).optional().default([]),
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
});

const inviteBodySchema = inviteUserSchema.or(inviteUserSchema.array().min(1));
const reinviteBodySchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  force: z.boolean().optional().default(false),
});

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

function objectIdOrUndefined(value?: string) {
  return value && mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : undefined;
}

async function sendInviteOrThrow(args: {
  request: NextRequest;
  businessId: string;
  to: string;
  attendeeName: string;
  workspaceName: string;
  rawToken: string;
}) {
  const emailResult = await sendTeamInviteEmail(args);

  if (!emailResult.sent) {
    throw ApiError.unavailable(
      emailResult.error ||
        emailResult.skippedReason ||
        "Unable to send team invite email"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.TEAM_INVITE);
    const body = parseOrThrow(inviteBodySchema, await request.json());
    const isBulk = Array.isArray(body);
    const usersData = isBulk ? body : [body];
    const currentBusinessId = verify.businessId;
    const business = await Business.findById(currentBusinessId).select("name");
    if (!business) throw ApiError.notFound("Workspace not found");

    const capitalize = (str: string) =>
      str.replace(/\b\w/g, (char) => char.toUpperCase());

    // const activeBusiness = await Business.findById(currentBusinessId);
    const results = [];
    const errors = [];

    // Process each user
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];

      try {
        if (userData.role === USER_TYPE.tenant) {
          errors.push({
            index: i,
            email: userData.email,
            error: "Use tenant management to invite tenants",
          });
          continue;
        }

        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
          const alreadyMember = await findWorkspaceMembershipByUser({
            workspaceId: currentBusinessId,
            userId: existingUser._id as mongoose.Types.ObjectId,
            statuses: [MEMBERSHIP_STATUS.active, MEMBERSHIP_STATUS.suspended],
          });

          if (alreadyMember) {
            errors.push({
              index: i,
              email: userData.email,
              error: "User already belongs to this business",
            });
            continue;
          }

          const businessObjectId = new mongoose.Types.ObjectId(
            currentBusinessId
          );
          const token = generateWorkspaceInviteToken();
          await upsertPendingWorkspaceInvite({
            workspaceId: businessObjectId,
            email: existingUser.email,
            name: existingUser.name,
            role: userData.role as never,
            invitedBy: verify.id,
            invitedUser: existingUser._id as mongoose.Types.ObjectId,
            rawToken: token,
            specialties: userData.specialties,
            propertyId: objectIdOrUndefined(userData.propertyId),
            unitId: objectIdOrUndefined(userData.unitId),
          });

          await sendInviteOrThrow({
            request,
            businessId: String(currentBusinessId),
            to: existingUser.email,
            attendeeName: existingUser.name,
            workspaceName: business.name,
            rawToken: token,
          });

          results.push({
            email: userData.email,
            status: "success",
          });
        } else {
          // New user
          const token = generateWorkspaceInviteToken();

          const newUser = new User({
            name: capitalize(userData.name),
            email: userData.email,
            dateOfBirth: userData.dateOfBirth,
          });

          await newUser.save({ validateBeforeSave: false });
          await upsertPendingWorkspaceInvite({
            workspaceId: currentBusinessId,
            email: newUser.email,
            name: newUser.name,
            role: userData.role as never,
            invitedBy: verify.id,
            invitedUser: newUser._id as mongoose.Types.ObjectId,
            rawToken: token,
            specialties: userData.specialties,
            propertyId: objectIdOrUndefined(userData.propertyId),
            unitId: objectIdOrUndefined(userData.unitId),
          });

          await sendInviteOrThrow({
            request,
            businessId: String(currentBusinessId),
            to: newUser.email,
            attendeeName: newUser.name,
            workspaceName: business.name,
            rawToken: token,
          });

          results.push({
            email: userData.email,
            status: "success",
          });
        }
      } catch (error: any) {
        errors.push({
          index: i,
          email: userData.email,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      status: "success",
      data: isBulk ? results : results[0],
      count: results.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.TEAM_INVITE);
    const currentBusinessId = verify.businessId;
    const { email } = parseOrThrow(
      reinviteBodySchema,
      await request.json()
    );
    const business = await Business.findById(currentBusinessId).select("name");
    if (!business) throw ApiError.notFound("Workspace not found");

    const user = await User.findOne({ email });
    if (!user) throw ApiError.notFound("User not found");

    const membership = await findWorkspaceMembershipByUser({
      workspaceId: currentBusinessId,
      userId: user._id as mongoose.Types.ObjectId,
      statuses: [MEMBERSHIP_STATUS.active, MEMBERSHIP_STATUS.suspended],
    });
    if (membership?.status === MEMBERSHIP_STATUS.active) {
      throw ApiError.badRequest("User is already activated for this business");
    }
    const existingInvite = await WorkspaceInvite.findOne({
      workspace: currentBusinessId,
      email: user.email,
      status: WORKSPACE_INVITE_STATUS.pending,
    }).select("role specialties property unit");
    const inviteRole = membership?.role ?? existingInvite?.role;
    if (!inviteRole) {
      throw ApiError.badRequest("No pending invite exists for this user");
    }

    const token = generateWorkspaceInviteToken();
    await upsertPendingWorkspaceInvite({
      workspaceId: currentBusinessId,
      email: user.email,
      name: user.name,
      role: inviteRole as never,
      invitedBy: verify.id,
      invitedUser: user._id as mongoose.Types.ObjectId,
      rawToken: token,
      specialties: existingInvite?.specialties,
      propertyId: existingInvite?.property,
      unitId: existingInvite?.unit,
    });

    await sendInviteOrThrow({
      request,
      businessId: String(currentBusinessId),
      to: user.email,
      attendeeName: user.name,
      workspaceName: business.name,
      rawToken: token,
    });

    return NextResponse.json({
      status: "success",
      message: "Invite re-sent successfully",
    });
  } catch (error: any) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
