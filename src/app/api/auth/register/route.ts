import { NextRequest } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { buildAuthSuccessResponse } from "@/lib/auth/issue-auth-session";
import {
  ensurePlatformRoleDefinitions,
  ensureWorkspaceRoleDefinitions,
  resolveWorkspaceRoleDefinitionId,
} from "@/lib/auth/role-definitions";
import {
  assertPasswordPolicy,
  getAppPasswordPolicy,
} from "@/lib/security/password-policy";
import { normalizeTimeZone } from "@/lib/date/timezone-options";
import User, { UserDoc } from "@/models/userModel";
import Business from "@/models/businessModel";
import { ROLES } from "@/shared/enums/enums";
import { WORKSPACE_ROLE } from "@/shared/auth/roles";
import { WORKSPACE_TYPE } from "@/shared/model/workspace.model";
import { SignupSchema } from "@/app/auth/model/model";
import { upsertActiveWorkspaceMembership } from "@/lib/tenancy/provisioning";
import { WORKSPACE_MEMBERSHIP_SOURCE } from "@/lib/tenancy/model";

const getRequestId = (request: NextRequest) =>
  request.headers.get("x-request-id") ?? undefined;

const getLegacyTokenPreview = (user: UserDoc) => {
  const tenants = user.tenantsClaim();
  return {
    id: user.id,
    role: tenants[0]?.role || ROLES.user,
    tenants,
  };
};

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();
    const attemptedRoleAssignment =
      "platformRole" in body ||
      "role" in body ||
      "memberships" in body ||
      "currentBusiness" in body;
    if (attemptedRoleAssignment) {
      throw ApiError.badRequest("Role assignment is not allowed during signup");
    }

    const payload = parseOrThrow(SignupSchema, body);
    const timezone = normalizeTimeZone(payload.timezone);
    const passwordPolicy = await getAppPasswordPolicy();
    assertPasswordPolicy(payload.password, passwordPolicy);
    const workspaceType = payload.workspaceType;

    const exists = await User.findOne({ email: payload.email });
    if (exists) throw ApiError.badRequest("Email already in use");

    const newUser = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      contact: payload.contact,
      countryCode: payload.countryCode,
      addressStructured: payload.addressStructured,
      passwordChangedAt: new Date(),
      emailVerifiedAt: new Date(),
    });

    const business = await Business.create({
      name: payload.businessName,
      workspaceType,
      email: payload.businessEmail || payload.email,
      contact: payload.businessContact || payload.contact,
      countryCode: payload.businessCountryCode || payload.countryCode,
      addressStructured: payload.addressStructured,
      creator: newUser._id,
      owner: newUser._id,
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
    });

    await Promise.all([
      ensurePlatformRoleDefinitions(),
      ensureWorkspaceRoleDefinitions({
        workspaceId: business.id,
        options: { createdBy: newUser._id as mongoose.Types.ObjectId },
      }),
    ]);

    const ownerRoleDefinitionId = await resolveWorkspaceRoleDefinitionId({
      workspaceId: business.id,
      role: WORKSPACE_ROLE.owner,
    });

    await upsertActiveWorkspaceMembership({
      workspaceId: business._id as mongoose.Types.ObjectId,
      userId: newUser._id as mongoose.Types.ObjectId,
      role: WORKSPACE_ROLE.owner as never,
      roleDefinition: ownerRoleDefinitionId as mongoose.Types.ObjectId | null,
      createdBy: newUser._id as mongoose.Types.ObjectId,
      source: WORKSPACE_MEMBERSHIP_SOURCE.signup,
      joinedAt: new Date(),
    });
    newUser.currentBusiness = business._id as mongoose.Types.ObjectId;
    await newUser.save({ validateBeforeSave: false });

    return buildAuthSuccessResponse({
      request,
      user: newUser,
      status: 201,
      body: {
        status: "success",
        ...getLegacyTokenPreview(newUser),
        data: { user: newUser },
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
