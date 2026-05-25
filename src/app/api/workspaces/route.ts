import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertPermission } from "@/lib/auth/permission-guards";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { PERMISSION } from "@/shared/auth/permission-registry";
import {
  ensureWorkspaceRoleDefinitions,
  resolveWorkspaceRoleDefinitionId,
} from "@/lib/auth/role-definitions";
import { normalizeTimeZone } from "@/lib/date/timezone-options";
import { upsertActiveWorkspaceMembership } from "@/lib/tenancy/provisioning";
import { WORKSPACE_MEMBERSHIP_SOURCE } from "@/lib/tenancy/model";
import { CreateWorkspaceSchema } from "@/shared/model/workspace-create.model";
import { WORKSPACE_ROLE } from "@/shared/auth/roles";
import { WORKSPACE_TYPE } from "@/shared/model/workspace.model";
import { ensureDefaultTicketCategories } from "@/lib/tickets/default-categories";
import { ensureDefaultTicketTypes } from "@/lib/tickets/default-ticket-type";
import APIFeatures from "@/utils/apiFeatures";
import { mapToObject } from "@/utils/helpers";
import Business from "@/models/businessModel";
import Property from "@/models/propertyModel";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import Ticket from "@/models/ticketModel";

const getRequestId = (req: NextRequest) =>
  req.headers.get("x-request-id");

export async function GET(request: NextRequest) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertPermission(
      {
        userId: verify.id,
        businessId: verify.businessId,
        platformRole: verify.platformRole,
        workspaceRole: verify.workspaceRole,
      },
      PERMISSION.PLATFORM_WORKSPACES_VIEW,
    );

    const filter: Record<string, unknown> = {};
    const transformedQuery = mapToObject(
      request.nextUrl.searchParams as unknown as Map<string, string>,
    ) as Record<string, unknown>;

    if (transformedQuery.name) {
      filter.name = { $regex: new RegExp(String(transformedQuery.name), "i") };
      delete transformedQuery.name;
    }
    if (transformedQuery.email) {
      filter.email = {
        $regex: new RegExp(String(transformedQuery.email), "i"),
      };
      delete transformedQuery.email;
    }
    if (transformedQuery.status) {
      filter.active = String(transformedQuery.status) === "active";
      delete transformedQuery.status;
    }
    if (transformedQuery.search) {
      const regex = new RegExp(String(transformedQuery.search), "i");
      filter.$or = [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { contact: { $regex: regex } },
      ];
      delete transformedQuery.search;
    }

    const baseQuery = Business.find(filter);

    const features = new APIFeatures(baseQuery, transformedQuery)
      .filter()
      .sort("-createdAt")
      .limitFields()
      .paginate();

    const workspaces = await features.query.lean<
      Array<{
        _id: Types.ObjectId;
        name: string;
        email?: string;
        contact?: string;
        countryCode?: string;
        address?: string;
        description?: string;
        logo?: string;
        active?: boolean;
        creator?: string | null;
        registrationId?: string;
        createdAt?: Date;
        updatedAt?: Date;
      }>
    >();

    const countFeatures = new APIFeatures(
      Business.find(filter),
      transformedQuery,
    ).filter();
    const totalRecords = await countFeatures.query.countDocuments();

    const workspaceIds = workspaces.map((w) => w._id);

    const [propertyAgg, unitAgg, ticketAgg, memberAgg, creators] =
      await Promise.all([
        Property.aggregate([
          { $match: { business: { $in: workspaceIds } } },
          { $group: { _id: "$business", count: { $sum: 1 } } },
        ]),
        Unit.aggregate([
          { $match: { business: { $in: workspaceIds } } },
          { $group: { _id: "$business", count: { $sum: 1 } } },
        ]),
        Ticket.aggregate([
          { $match: { business: { $in: workspaceIds } } },
          { $group: { _id: "$business", count: { $sum: 1 } } },
        ]),
        User.aggregate([
          { $unwind: "$memberships" },
          { $match: { "memberships.business": { $in: workspaceIds } } },
          {
            $group: {
              _id: "$memberships.business",
              count: { $sum: 1 },
            },
          },
        ]),
        User.find({
          _id: {
            $in: workspaces
              .map((w) => w.creator)
              .filter((id): id is string => Boolean(id) && Types.ObjectId.isValid(String(id))),
          },
        })
          .select("name email")
          .lean<{ _id: Types.ObjectId; name?: string; email?: string }[]>(),
      ]);

    const propertyCountByWorkspace = new Map(
      propertyAgg.map((row) => [String(row._id), row.count as number]),
    );
    const unitCountByWorkspace = new Map(
      unitAgg.map((row) => [String(row._id), row.count as number]),
    );
    const ticketCountByWorkspace = new Map(
      ticketAgg.map((row) => [String(row._id), row.count as number]),
    );
    const memberCountByWorkspace = new Map(
      memberAgg.map((row) => [String(row._id), row.count as number]),
    );
    const creatorById = new Map(creators.map((c) => [String(c._id), c]));

    const data = workspaces.map((w) => {
      const id = String(w._id);
      const creator = w.creator ? creatorById.get(String(w.creator)) : null;
      return {
        _id: id,
        id,
        name: w.name,
        email: w.email,
        contact: w.contact,
        countryCode: w.countryCode,
        address: w.address,
        description: w.description,
        logo: w.logo,
        registrationId: w.registrationId,
        isActive: w.active ?? true,
        createdAt: w.createdAt?.toISOString(),
        updatedAt: w.updatedAt?.toISOString(),
        creator: creator
          ? {
              _id: String(creator._id),
              name: creator.name,
              email: creator.email,
            }
          : null,
        propertyCount: propertyCountByWorkspace.get(id) ?? 0,
        unitCount: unitCountByWorkspace.get(id) ?? 0,
        ticketCount: ticketCountByWorkspace.get(id) ?? 0,
        memberCount: memberCountByWorkspace.get(id) ?? 0,
      };
    });

    return NextResponse.json({
      status: "success",
      totalRecords,
      results: data.length,
      data,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    const payload = parseOrThrow(CreateWorkspaceSchema, await request.json());
    const user = await User.findById(verify.id).select("name email contact countryCode");
    if (!user) throw ApiError.notFound("User not found");
    await Promise.all([
      ensureDefaultTicketCategories(),
      ensureDefaultTicketTypes(),
    ]);

    const workspaceType = payload.workspaceType;
    const business = await Business.create({
      name: payload.businessName,
      workspaceType,
      email: payload.businessEmail || user.email,
      contact: payload.businessContact || user.contact || "",
      countryCode: payload.businessCountryCode || user.countryCode || "US",
      timezone: normalizeTimeZone(payload.timezone),
      addressStructured: payload.addressStructured,
      creator: user._id,
      owner: user._id,
      settings: {
        general: {
          timezone: normalizeTimeZone(payload.timezone),
          team: {
            allowTeamInvitations: workspaceType !== WORKSPACE_TYPE.INDIVIDUAL,
            defaultRoleForNewMembers: WORKSPACE_ROLE.member,
          },
        },
      },
    });

    await ensureWorkspaceRoleDefinitions({
      workspaceId: business.id,
      options: { createdBy: user._id as mongoose.Types.ObjectId },
    });

    const ownerRoleDefinitionId = await resolveWorkspaceRoleDefinitionId({
      workspaceId: business.id,
      role: WORKSPACE_ROLE.owner,
    });

    await upsertActiveWorkspaceMembership({
      workspaceId: business._id as mongoose.Types.ObjectId,
      userId: user._id as mongoose.Types.ObjectId,
      role: WORKSPACE_ROLE.owner as never,
      roleDefinition: ownerRoleDefinitionId as mongoose.Types.ObjectId | null,
      createdBy: user._id as mongoose.Types.ObjectId,
      source: WORKSPACE_MEMBERSHIP_SOURCE.signup,
      joinedAt: new Date(),
    });

    user.currentBusiness = business._id as mongoose.Types.ObjectId;
    await user.save({ validateBeforeSave: false });

    return NextResponse.json({
      ok: true,
      message: "Workspace created",
      data: {
        businessId: business.id,
      },
    }, { status: 201 });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
