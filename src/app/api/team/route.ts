import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertPermission } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { INVITE_STATUS } from "@/shared/enums/enums";
import { PERMISSION } from "@/shared/auth/permission-registry";
import {
  toLegacySessionRole,
  WORKSPACE_ROLE,
} from "@/shared/auth/roles";
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import { sendTeamInviteEmail } from "@/lib/email/senders/team/sendTeamInviteEmail";
import { generateInviteToken } from "@/utils/helpers";
import {
  TEAM_MEMBER_STATUS,
  TeamInvitePayloadSchema,
  type TeamListItem,
  type TeamListMeta,
  type TeamListSummary,
} from "@/features/team/models/team.model";

const getRequestId = (req: NextRequest) =>
  req.headers.get("x-request-id") ?? undefined;

function membershipToTeamListItem(args: {
  user: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    createdAt?: Date;
  };
  membership: {
    business: { toString(): string };
    role: string;
    status: string;
    isCreator?: boolean;
    inviteToken?: string;
    inviteTokenExpires?: Date;
    roleDefinition?: { toString(): string } | null;
  };
  currentUserId: string;
}): TeamListItem {
  const isInvite = args.membership.status !== INVITE_STATUS.activated;
  const inviteExpiresAt = args.membership.inviteTokenExpires?.toISOString() ?? null;
  const isInviteExpired = isInvite && !!args.membership.inviteTokenExpires
    ? new Date(args.membership.inviteTokenExpires).getTime() <= Date.now()
    : false;

  const status: TEAM_MEMBER_STATUS = isInvite
    ? TEAM_MEMBER_STATUS.pending
    : TEAM_MEMBER_STATUS.active;

  return {
    id: String(args.user._id),
    kind: isInvite ? "invite" : "member",
    name: args.user.name,
    email: args.user.email,
    role: (args.membership.role as WORKSPACE_ROLE) ?? WORKSPACE_ROLE.member,
    roleDefinitionId: args.membership.roleDefinition
      ? String(args.membership.roleDefinition)
      : null,
    roleDefinitionKey: null,
    roleDefinitionName: null,
    isCustomRole: !!args.membership.roleDefinition,
    status,
    joinedAt: !isInvite ? (args.user.createdAt?.toISOString() ?? null) : null,
    invitedAt: isInvite ? (args.user.createdAt?.toISOString() ?? null) : null,
    inviteExpiresAt,
    isInviteExpired,
    lastSentAt: null,
    isCurrentUser: String(args.user._id) === args.currentUserId,
  };
}

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
      PERMISSION.TEAM_VIEW,
    );

    const businessId = verify.businessId;
    if (!businessId) throw ApiError.badRequest("No active workspace");
    const businessObjectId = new mongoose.Types.ObjectId(businessId);

    const url = request.nextUrl;
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const name = url.searchParams.get("name")?.trim().toLowerCase() ?? "";
    const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";
    const search = url.searchParams.get("search")?.trim().toLowerCase() ?? "";
    const statusFilter = url.searchParams.get("status") ?? "";
    const roleFilter = url.searchParams.get("role") ?? "";

    const users = await User.find({
      "memberships.business": businessObjectId,
    })
      .select("name email memberships createdAt")
      .lean<
        Array<{
          _id: mongoose.Types.ObjectId;
          name: string;
          email: string;
          createdAt?: Date;
          memberships: Array<{
            business: mongoose.Types.ObjectId;
            role: string;
            status: string;
            isCreator?: boolean;
            inviteToken?: string;
            inviteTokenExpires?: Date;
            roleDefinition?: mongoose.Types.ObjectId | null;
          }>;
        }>
      >();

    const business = await Business.findById(businessId)
      .select("name")
      .lean<{ name?: string } | null>();

    const allItems: TeamListItem[] = users
      .map((user) => {
        const membership = user.memberships.find(
          (m) => String(m.business) === businessId,
        );
        if (!membership) return null;
        return membershipToTeamListItem({
          user,
          membership,
          currentUserId: verify.id,
        });
      })
      .filter((item): item is TeamListItem => item !== null);

    const filtered = allItems.filter((item) => {
      if (name && !item.name.toLowerCase().includes(name)) return false;
      if (email && !item.email.toLowerCase().includes(email)) return false;
      if (
        search &&
        !`${item.name} ${item.email}`.toLowerCase().includes(search)
      )
        return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (roleFilter && item.role !== roleFilter) return false;
      return true;
    });

    const summary: TeamListSummary = {
      total: allItems.length,
      active: allItems.filter((i) => i.status === TEAM_MEMBER_STATUS.active)
        .length,
      pending: allItems.filter((i) => i.status === TEAM_MEMBER_STATUS.pending)
        .length,
      accepted: 0,
      declined: 0,
    };

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    const meta: TeamListMeta = {
      allowTeamInvitations: true,
      defaultRoleForNewMembers: WORKSPACE_ROLE.member,
      currentUserId: verify.id,
      businessName: business?.name ?? "Workspace",
    };

    return NextResponse.json({
      status: "success",
      data,
      totalRecords: filtered.length,
      results: data.length,
      summary,
      meta,
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
    await assertPermission(
      {
        userId: verify.id,
        businessId: verify.businessId,
        platformRole: verify.platformRole,
        workspaceRole: verify.workspaceRole,
      },
      PERMISSION.TEAM_INVITE,
    );

    const businessId = verify.businessId;
    if (!businessId) throw ApiError.badRequest("No active workspace");

    const body = parseOrThrow(TeamInvitePayloadSchema, await request.json());

    const business = await Business.findById(businessId)
      .select("name")
      .lean<{ name?: string } | null>();
    if (!business) throw ApiError.notFound("Workspace not found");

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      const existingMembership = existingUser.memberships.find(
        (m) => String(m.business) === businessId,
      );
      if (existingMembership) {
        throw ApiError.badRequest(
          "This user already belongs to the workspace.",
        );
      }
    }

    const invite = generateInviteToken();
    const rawToken = invite.token;
    const inviteTokenExpires = invite.expires;
    const legacyRole = toLegacySessionRole(body.role) ?? body.role;

    if (existingUser) {
      existingUser.memberships.push({
        business: new mongoose.Types.ObjectId(businessId),
        role: legacyRole as never,
        status: INVITE_STATUS.invited,
        isCreator: false,
        inviteToken: rawToken,
        inviteTokenExpires,
      } as never);
      await existingUser.save({ validateBeforeSave: false });
    } else {
      await User.create({
        name: body.name,
        email: body.email,
        password: rawToken,
        memberships: [
          {
            business: new mongoose.Types.ObjectId(businessId),
            role: legacyRole,
            status: INVITE_STATUS.invited,
            isCreator: false,
            inviteToken: rawToken,
            inviteTokenExpires,
          },
        ],
      });
    }

    const emailResult = await sendTeamInviteEmail({
      request,
      businessId,
      to: body.email,
      attendeeName: body.name,
      workspaceName: business.name ?? "Workspace",
      rawToken,
    });

    if (!emailResult.sent) {
      throw ApiError.unavailable(
        emailResult.error || "Unable to send the team invitation email",
      );
    }

    return NextResponse.json({
      status: "success",
      message: `Invitation sent to ${body.email}`,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
