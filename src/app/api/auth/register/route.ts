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
import User, { UserDoc } from "@/models/userModel";
import Business from "@/models/businessModel";
import { NextRequest } from "next/server";
import { INVITE_STATUS, ROLES } from "@/shared/enums/enums";
import { WORKSPACE_ROLE } from "@/shared/auth/roles";
import { z } from "zod";

connect();

const getLegacyTokenPreview = (user: UserDoc) => {
  const { id } = user;
  const tenants = user.tenantsClaim();
  return {
    id,
    role: tenants[0]?.role || ROLES.user,
    tenants,
  };
};

const registerBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(1, "Business name is required"),
  registrationId: z.string().min(1, "Registration ID is required"),
  businessContact: z.string().min(1, "Business contact is required"),
  countryCode: z.string().min(1, "Country code is required"),
  country: z.string().min(1, "Country is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  businessEmail: z.string().email("Please provide a valid business email"),
});

export async function POST(request: NextRequest) {
  try {
    const body = parseOrThrow(registerBodySchema, await request.json());

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      throw ApiError.badRequest("Email is already in use");
    }

    const business = await Business.create({
      name: body.businessName,
      registrationId: body.registrationId,
      contact: body.businessContact,
      countryCode: body.countryCode,
      country: body.country,
      address: body.businessAddress,
      email: body.businessEmail,
      creator: body.name,
    });

    if (!business) {
      throw ApiError.internal("Business could not be created");
    }

    await Promise.all([
      ensurePlatformRoleDefinitions(),
      ensureWorkspaceRoleDefinitions({
        workspaceId: business.id,
        options: { createdBy: null },
      }),
    ]);
    const ownerRoleDefinitionId = await resolveWorkspaceRoleDefinitionId({
      workspaceId: business.id,
      role: WORKSPACE_ROLE.owner,
    });

    const newUser = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
      memberships: [
        {
          business: business.id,
          role: ROLES.admin,
          status: INVITE_STATUS.activated,
          isCreator: true,
          roleDefinition: ownerRoleDefinitionId ?? undefined,
        },
      ],
      currentBusiness: business.id,
    });

    delete (newUser as any).password;

    return buildAuthSuccessResponse({
      request,
      user: newUser,
      status: 201,
      body: {
        status: "success",
        ...getLegacyTokenPreview(newUser),
        data: {
          user: newUser,
        },
      },
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
