import { INVITE_STATUS, ROLES } from "@/shared/enums/enums";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { toLegacySessionRole } from "@/shared/auth/roles";
import { Emails } from "@/utils/email-resend";
import { generateInviteToken } from "@/utils/helpers";
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

function normalizeMembershipRole(role: string) {
  return toLegacySessionRole(role) ?? (role as ROLES);
}

function objectIdOrUndefined(value?: string) {
  return value && mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : undefined;
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
        const existingUser = await User.findOne({ email: userData.email });
        const membershipRole = normalizeMembershipRole(userData.role);

        if (existingUser) {
          const alreadyMember = existingUser.memberships.some(
            (m) => m.business.toString() === currentBusinessId.toString()
          );

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
          const { token, hashed, expires } = generateInviteToken();

          // Append the new membership
          existingUser.memberships.push({
            business: businessObjectId,
            role: membershipRole,
            status: INVITE_STATUS.invited,
            inviteToken: hashed,
            inviteTokenExpires: expires,
            specialties: userData.specialties as any,
            property: objectIdOrUndefined(userData.propertyId),
            unit: objectIdOrUndefined(userData.unitId),
            isCreator: false,
          });

          // Optional: only update currentBusiness if none is set
          if (!existingUser.currentBusiness) {
            existingUser.currentBusiness = businessObjectId;
          }

          await existingUser.save({ validateBeforeSave: false });

          // Construct invite URL
          const inviteURL =
            process.env.NODE_ENV === "development"
              ? `${process.env.DEVELOPMENT_URL}/auth/onboard-user/${token}`
              : `${process.env.PRODUCTION_URL}/auth/onboard-user/${token}`;

          // Send invite email
          await new Emails(
            existingUser,
            inviteURL,
            business.name
          ).sendInviteUser();

          results.push({
            email: userData.email,
            status: "success",
            url: inviteURL,
          });
        } else {
          // New user
          const { token, hashed, expires } = generateInviteToken();

          const newUser = new User({
            name: capitalize(userData.name),
            email: userData.email,
            dateOfBirth: userData.dateOfBirth,
            memberships: [
              {
                business: currentBusinessId,
                role: membershipRole,
                status: INVITE_STATUS.invited,
                inviteToken: hashed,
                inviteTokenExpires: expires,
                specialties: userData.specialties || [],
                property: userData.propertyId,
                unit: userData.unitId,
              },
            ],
            currentBusiness: currentBusinessId,
          });

          await newUser.save({ validateBeforeSave: false });

          // Construct invite URL
          const inviteURL =
            process.env.NODE_ENV === "development"
              ? `${process.env.DEVELOPMENT_URL}/auth/onboard-user/${token}`
              : `${process.env.PRODUCTION_URL}/auth/onboard-user/${token}`;

          // Send invite email
          await new Emails(
            newUser,
            business.name,
            inviteURL
          ).sendInviteUser();

          results.push({
            email: userData.email,
            status: "success",
            url: inviteURL,
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
    const { email, force } = parseOrThrow(
      reinviteBodySchema,
      await request.json()
    );
    const business = await Business.findById(currentBusinessId).select("name");
    if (!business) throw ApiError.notFound("Workspace not found");

    const user = await User.findOne({ email });
    if (!user) throw ApiError.notFound("User not found");

    const businessIdStr = String(currentBusinessId);
    const membershipIndex = user.memberships.findIndex(
      (m: any) => String(m.business) === businessIdStr
    );

    if (membershipIndex === -1) {
      throw ApiError.badRequest(
        "User does not have a membership with this business"
      );
    }

    const membership = user.memberships[membershipIndex];

    // 5) Block re-invite if already activated
    if (membership.status === INVITE_STATUS.activated) {
      throw ApiError.badRequest("User is already activated for this business");
    }

    // 6) Check expiry logic
    const now = new Date();
    const hasExpiry =
      membership.inviteTokenExpires !== undefined &&
      membership.inviteTokenExpires !== null;
    const isExpired = hasExpiry
      ? now > new Date(membership.inviteTokenExpires as string | number | Date)
      : true;

    if (!isExpired && !force) {
      // Invite still valid → do not rotate unless explicitly forced
      throw ApiError.badRequest("Existing invite token is still valid", {
        expiresAt: membership.inviteTokenExpires,
      });
    }

    // 7) Generate a fresh token and update membership
    const { token, hashed, expires } = generateInviteToken();

    membership.inviteToken = hashed;
    membership.inviteTokenExpires = expires;
    membership.status = INVITE_STATUS.invited;

    // (Optional) ensure currentBusiness is set
    if (!user.currentBusiness) {
      user.currentBusiness = new mongoose.Types.ObjectId(currentBusinessId);
    }

    await user.save({ validateBeforeSave: false });

    // 8) Build invite URL using the *plain* token (not hashed)
    const inviteURL =
      process.env.NODE_ENV === "development"
        ? `${process.env.DEVELOPMENT_URL}/auth/onboard-user/${token}`
        : `${process.env.PRODUCTION_URL}/auth/onboard-user/${token}`;

    // 9) Send the invite email
    await new Emails(
      user,
      business.name,
      inviteURL
    ).sendInviteUser();

    return NextResponse.json({
      status: "success",
      message: "Invite re-sent successfully",
      url: inviteURL,
      expiresAt: expires,
    });
  } catch (error: any) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
