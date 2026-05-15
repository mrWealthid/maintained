import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import User, { IUser } from "@/models/userModel";
import WorkspaceMembership from "@/models/workspaceMembershipModel";
import { MEMBERSHIP_STATUS } from "@/shared/auth/roles";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { teamListQuerySchema } from "@/features/team/models/team-form.model";
import APIFeatures from "@/utils/apiFeatures";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

connect();

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.TEAM_VIEW);
    const parsedQuery = parseOrThrow(
      teamListQuerySchema.extend({
        name: teamListQuerySchema.shape.search.optional(),
        excludeSelf: teamListQuerySchema.shape.search.optional(),
        excludeInactive: teamListQuerySchema.shape.search.optional(),
        specialty: teamListQuerySchema.shape.search.optional(),
      }),
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    const currentBusinessId = new mongoose.Types.ObjectId(verify.businessId);
    const membershipFilter: Record<string, unknown> = {
      workspace: currentBusinessId,
    };
    const transformedQuery: Record<string, unknown> = { ...parsedQuery };

    if (parsedQuery.status) {
      membershipFilter.status =
        parsedQuery.status === "ACTIVATED" || parsedQuery.status === "active"
          ? MEMBERSHIP_STATUS.active
          : parsedQuery.status;
      delete transformedQuery.status;
    } else if (request.nextUrl.searchParams.get("excludeInactive") === "true") {
      membershipFilter.status = MEMBERSHIP_STATUS.active;
      delete transformedQuery.excludeInactive;
    }

    if (parsedQuery.role) {
      membershipFilter.role = parsedQuery.role;
      delete transformedQuery.role;
    }

    if (parsedQuery.specialty) {
      membershipFilter.specialties = parsedQuery.specialty;
      delete transformedQuery.specialty;
    }

    const memberships = await WorkspaceMembership.find(membershipFilter)
      .select("workspace user role status joinedAt specialties source")
      .populate({ path: "workspace", select: "name" })
      .lean<{
        workspace: { _id: mongoose.Types.ObjectId; name?: string } | mongoose.Types.ObjectId;
        user: mongoose.Types.ObjectId;
        role: string;
        status: string;
        joinedAt?: Date | null;
        specialties?: string[];
        source?: string;
      }[]>();
    const membershipByUserId = new Map(
      memberships.map((membership) => [membership.user.toString(), membership])
    );
    const memberUserIds = memberships.map((membership) => membership.user);
    const filter: Record<string, unknown> = {
      _id: { $in: memberUserIds },
    };

    if (request.nextUrl.searchParams.get("excludeSelf") === "true") {
      filter._id = { $in: memberUserIds, $ne: verify.id };
      delete transformedQuery.excludeSelf;
    }

    const searchName = parsedQuery.name ?? parsedQuery.search;
    if (searchName) {
      filter.name = { $regex: new RegExp(searchName, "i") };
      delete transformedQuery.name;
      delete transformedQuery.search;
    }

    const features = new APIFeatures(User.find(filter), transformedQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate([
        { path: "currentBusiness", select: "name country" },
        { path: "memberships.business", select: "name" },
      ]);

    const users = await features.query;
    const data = users.map((user: IUser & { toObject?: () => Record<string, any> }) => {
      const plainUser = typeof user.toObject === "function" ? user.toObject() : user;
      const membership = membershipByUserId.get(user.id);
      const workspace =
        membership?.workspace && "name" in membership.workspace
          ? {
              id: membership.workspace._id.toString(),
              name: membership.workspace.name ?? "",
            }
          : {
              id: currentBusinessId.toString(),
              name: "",
            };

      return {
        ...plainUser,
        memberships: membership
          ? [
              {
                business: workspace,
                status: membership.status,
                role: membership.role,
                id: `${currentBusinessId.toString()}:${user.id}`,
                inviteExpired: false,
                isCreator: false,
                specialties: membership.specialties ?? [],
                source: membership.source,
              },
            ]
          : [],
      };
    });
    const countFeatures = new APIFeatures<IUser>(
      User.find(filter),
      transformedQuery
    ).filter();
    const count = await countFeatures.query.countDocuments();

    return NextResponse.json({
      status: "success",
      totalRecords: count,
      results: data.length,
      data,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
