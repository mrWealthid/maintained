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
import { PERMISSION } from "@/shared/auth/permission-registry";
import {
  MEMBERSHIP_STATUS,
  WORKSPACE_ROLE,
} from "@/shared/auth/roles";
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import WorkspaceInvite from "@/models/workspaceInviteModel";
import { sendTeamInviteEmail } from "@/lib/email/senders/team/sendTeamInviteEmail";
import {
  generateWorkspaceInviteToken,
  upsertPendingWorkspaceInvite,
} from "@/lib/tenancy/invites";
import { WORKSPACE_INVITE_STATUS } from "@/lib/tenancy/model";
import {
  findWorkspaceMembershipByUser,
  listWorkspaceMembershipsByWorkspace,
} from "@/lib/tenancy/workspace-membership-access";
import {
  TEAM_MEMBER_STATUS,
  TeamInvitePayloadSchema,
  type TeamListItem,
  type TeamListMeta,
  type TeamListSummary,
} from "@/features/team/models/team.model";

const getRequestId = (req: NextRequest) =>
  req.headers.get("x-request-id") ?? undefined;

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

    const [workspaceMemberships, workspaceInvites] = await Promise.all([
      listWorkspaceMembershipsByWorkspace({
        workspaceId: businessObjectId,
      })
        .populate({
          path: "roleDefinition",
          select: "key name isSystem legacyRole",
        })
        .populate({
          path: "user",
          select: "name email active",
        })
        .lean<
          Array<{
            roleDefinition?: {
              _id?: mongoose.Types.ObjectId;
              key?: string;
              name?: string;
              isSystem?: boolean;
              legacyRole?: string | null;
            } | null;
            user?: {
              _id?: mongoose.Types.ObjectId;
              name?: string;
              email?: string;
              active?: boolean;
            } | null;
            role?: string | null;
            joinedAt?: Date | null;
          }>
        >(),
      WorkspaceInvite.find({
        workspace: businessObjectId,
        status: WORKSPACE_INVITE_STATUS.pending,
      })
        .select("name email role invitedUser invitedAt lastSentAt tokenExpiresAt")
        .populate({
          path: "invitedUser",
          select: "active",
        })
        .lean<
          Array<{
            _id: mongoose.Types.ObjectId;
            name: string;
            email: string;
            role: string;
            invitedUser?: {
              _id?: mongoose.Types.ObjectId;
              active?: boolean;
            } | null;
            invitedAt?: Date | null;
            lastSentAt?: Date | null;
            tokenExpiresAt?: Date | null;
          }>
        >(),
    ]);

    const business = await Business.findById(businessId)
      .select("name")
      .lean<{ name?: string } | null>();

    const memberItems: TeamListItem[] = workspaceMemberships.flatMap((membership) => {
      if (
        !membership.user?._id ||
        !membership.user.name ||
        !membership.user.email ||
        membership.user.active === false
      ) {
        return [];
      }

      return [{
        id: membership.user._id.toString(),
        kind: "member" as const,
        name: membership.user.name,
        email: membership.user.email,
        role: membership.role as TeamListItem["role"],
        roleDefinitionId: membership.roleDefinition?._id?.toString() ?? null,
        roleDefinitionKey: membership.roleDefinition?.key ?? null,
        roleDefinitionName: membership.roleDefinition?.name ?? null,
        isCustomRole: membership.roleDefinition?.isSystem === false,
        status: TEAM_MEMBER_STATUS.active,
        joinedAt: membership.joinedAt?.toISOString() ?? null,
        invitedAt: null,
        inviteExpiresAt: null,
        isInviteExpired: false,
        lastSentAt: null,
        isCurrentUser: membership.user._id.toString() === verify.id,
      }];
    });
    const activeMemberIds = new Set(memberItems.map((member) => member.id));
    const inviteItems: TeamListItem[] = workspaceInvites.flatMap((invite) => {
      const invitedUserId = invite.invitedUser?._id?.toString() ?? null;
      if (
        (invitedUserId && activeMemberIds.has(invitedUserId)) ||
        invite.invitedUser?.active === false
      ) {
        return [];
      }

      return [
        {
          id: invitedUserId ?? invite._id.toString(),
          kind: "invite" as const,
          name: invite.name,
          email: invite.email,
          role: invite.role as TeamListItem["role"],
          roleDefinitionId: null,
          roleDefinitionKey: null,
          roleDefinitionName: null,
          isCustomRole: false,
          status: TEAM_MEMBER_STATUS.pending,
          joinedAt: null,
          invitedAt: invite.invitedAt?.toISOString() ?? null,
          inviteExpiresAt: invite.tokenExpiresAt?.toISOString() ?? null,
          isInviteExpired:
            !!invite.tokenExpiresAt &&
            invite.tokenExpiresAt.getTime() <= Date.now(),
          lastSentAt: invite.lastSentAt?.toISOString() ?? null,
          isCurrentUser: invitedUserId === verify.id,
        },
      ];
    });
    const allItems = [...memberItems, ...inviteItems];

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
    const businessObjectId = new mongoose.Types.ObjectId(businessId);

    const body = parseOrThrow(TeamInvitePayloadSchema, await request.json());

    const business = await Business.findById(businessId)
      .select("name")
      .lean<{ name?: string } | null>();
    if (!business) throw ApiError.notFound("Workspace not found");

    const normalizedEmail = body.email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail }).select(
      "name email memberships",
    );
    if (existingUser) {
      const existingMembership = existingUser.memberships.find(
        (m) => String(m.business) === businessId,
      );
      const workspaceMembership = await findWorkspaceMembershipByUser({
        workspaceId: businessObjectId,
        userId: existingUser._id as mongoose.Types.ObjectId,
        statuses: [MEMBERSHIP_STATUS.active, MEMBERSHIP_STATUS.suspended],
      });
      if (existingMembership || workspaceMembership) {
        throw ApiError.badRequest(
          "This user already belongs to the workspace.",
        );
      }
    }

    const rawToken = generateWorkspaceInviteToken();
    await upsertPendingWorkspaceInvite({
      workspaceId: new mongoose.Types.ObjectId(businessId),
      email: normalizedEmail,
      name: body.name,
      role: body.role as never,
      invitedBy: new mongoose.Types.ObjectId(verify.id),
      invitedUser: existingUser?._id as mongoose.Types.ObjectId | undefined,
      rawToken,
    });

    const emailResult = await sendTeamInviteEmail({
      request,
      businessId,
      to: normalizedEmail,
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
      message: `Invitation sent to ${normalizedEmail}`,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
