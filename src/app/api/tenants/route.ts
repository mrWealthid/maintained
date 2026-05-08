import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import {
  generateWorkspaceInviteToken,
  upsertPendingWorkspaceInvite,
} from "@/lib/tenancy/invites";
import { WORKSPACE_INVITE_STATUS } from "@/lib/tenancy/model";
import { findWorkspaceMembershipByUser } from "@/lib/tenancy/workspace-membership-access";
import Business from "@/models/businessModel";
import Property from "@/models/propertyModel";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import WorkspaceInvite from "@/models/workspaceInviteModel";
import WorkspaceMembership from "@/models/workspaceMembershipModel";
import { sendTeamInviteEmail } from "@/lib/email/senders/team/sendTeamInviteEmail";
import { tenantInviteFormSchema, tenantListQuerySchema } from "@/features/tenants/models/tenant-form.model";
import { MEMBERSHIP_STATUS, USER_TYPE } from "@/shared/auth/roles";
import { PERMISSION } from "@/shared/auth/permission-registry";

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

function objectId(value: string) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw ApiError.badRequest("Invalid identifier");
  }
  return new mongoose.Types.ObjectId(value);
}

function isObjectId(value?: string) {
  return Boolean(value && mongoose.Types.ObjectId.isValid(value));
}

export async function GET(request: NextRequest) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    await assertWorkspacePermissionKey(verify, PERMISSION.TENANTS_VIEW);

    const query = parseOrThrow(
      tenantListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const workspaceId = objectId(verify.businessId);

    const membershipFilter: Record<string, unknown> = {
      workspace: workspaceId,
      role: USER_TYPE.tenant,
      status: MEMBERSHIP_STATUS.active,
    };
    const inviteFilter: Record<string, unknown> = {
      workspace: workspaceId,
      role: USER_TYPE.tenant,
      status: WORKSPACE_INVITE_STATUS.pending,
    };

    if (query.property) {
      if (isObjectId(query.property)) {
        const propertyId = objectId(query.property);
        membershipFilter.property = propertyId;
        inviteFilter.property = propertyId;
      } else {
        const properties = await Property.find({
          business: workspaceId,
          name: { $regex: query.property, $options: "i" },
        }).select("_id");
        const propertyIds = properties.map((property) => property._id);
        membershipFilter.property = { $in: propertyIds };
        inviteFilter.property = { $in: propertyIds };
      }
    }
    if (query.unit) {
      if (isObjectId(query.unit)) {
        const unitId = objectId(query.unit);
        membershipFilter.unit = unitId;
        inviteFilter.unit = unitId;
      } else {
        const units = await Unit.find({
          business: workspaceId,
          label: { $regex: query.unit, $options: "i" },
          ...(membershipFilter.property ? { property: membershipFilter.property } : {}),
        }).select("_id");
        const unitIds = units.map((unit) => unit._id);
        membershipFilter.unit = { $in: unitIds };
        inviteFilter.unit = { $in: unitIds };
      }
    }
    const name = request.nextUrl.searchParams.get("name")?.trim().toLowerCase();
    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();

    const [memberships, invites] = await Promise.all([
      WorkspaceMembership.find(membershipFilter)
        .populate({ path: "user", select: "name email active" })
        .populate({ path: "property", select: "name type" })
        .populate({
          path: "unit",
          select:
            "label floor bedrooms bathrooms sizeSqft monthlyRent tenantActive",
        })
        .sort({ updatedAt: -1 })
        .lean(),
      WorkspaceInvite.find(inviteFilter)
        .select("name email invitedUser property unit invitedAt tokenExpiresAt")
        .populate({ path: "property", select: "name type" })
        .populate({
          path: "unit",
          select:
            "label floor bedrooms bathrooms sizeSqft monthlyRent tenantActive",
        })
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    const activeTenantUserIds = new Set(
      memberships
        .map((membership) => String((membership.user as { _id?: unknown })?._id ?? ""))
        .filter(Boolean),
    );

    const rows = [
      ...memberships.flatMap((membership) => {
        const user = membership.user as {
          _id?: mongoose.Types.ObjectId;
          name?: string;
          email?: string;
          active?: boolean;
        } | null;
        if (!user?._id || user.active === false) return [];
        return [
          {
            id: user._id.toString(),
            kind: "tenant" as const,
            name: user.name ?? "Tenant",
            email: user.email ?? "",
            status: "active" as const,
            property: membership.property,
            unit: membership.unit,
            joinedAt: membership.joinedAt ?? null,
            invitedAt: null,
            inviteExpiresAt: null,
          },
        ];
      }),
      ...invites.flatMap((invite) => {
        const invitedUser = invite.invitedUser as mongoose.Types.ObjectId | undefined;
        if (invitedUser && activeTenantUserIds.has(invitedUser.toString())) {
          return [];
        }
        return [
          {
            id: invite._id.toString(),
            kind: "invite" as const,
            name: invite.name,
            email: invite.email,
            status: "pending" as const,
            property: invite.property,
            unit: invite.unit,
            joinedAt: null,
            invitedAt: invite.invitedAt ?? null,
            inviteExpiresAt: invite.tokenExpiresAt ?? null,
          },
        ];
      }),
    ];

    const search = query.search?.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (query.status && row.status !== query.status) return false;
      if (name && !row.name.toLowerCase().includes(name)) return false;
      if (email && !row.email.toLowerCase().includes(email)) return false;
      if (search && !`${row.name} ${row.email}`.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    });

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return NextResponse.json({
      status: "success",
      data,
      totalRecords: filtered.length,
      results: data.length,
      summary: {
        total: rows.length,
        active: rows.filter((row) => row.status === "active").length,
        pending: rows.filter((row) => row.status === "pending").length,
      },
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
    await assertWorkspacePermissionKey(verify, PERMISSION.TENANTS_INVITE);
    await assertWorkspacePermissionKey(verify, PERMISSION.UNITS_TENANT_ASSIGN);

    const body = parseOrThrow(tenantInviteFormSchema, await request.json());
    const workspaceId = objectId(verify.businessId);
    const propertyId = objectId(body.property);
    const unitId = objectId(body.unit);

    const [business, unit] = await Promise.all([
      Business.findById(workspaceId).select("name"),
      Unit.findOne({
        _id: unitId,
        property: propertyId,
        business: workspaceId,
        isActive: true,
      }).select("tenantActive tenantUser label"),
    ]);

    if (!business) throw ApiError.notFound("Workspace not found");
    if (!unit) throw ApiError.badRequest("Selected unit was not found");
    if (unit.tenantActive || unit.tenantUser) {
      throw ApiError.badRequest("Selected unit already has an active tenant");
    }

    const pendingUnitInvite = await WorkspaceInvite.findOne({
      workspace: workspaceId,
      unit: unitId,
      role: USER_TYPE.tenant,
      status: WORKSPACE_INVITE_STATUS.pending,
    }).select("_id");

    if (pendingUnitInvite) {
      throw ApiError.badRequest("Selected unit already has a pending tenant invite");
    }

    const email = body.email.toLowerCase().trim();
    const existingUser = await User.findOne({ email }).select("name email");
    if (existingUser) {
      const membership = await findWorkspaceMembershipByUser({
        workspaceId,
        userId: existingUser._id as mongoose.Types.ObjectId,
        statuses: [MEMBERSHIP_STATUS.active, MEMBERSHIP_STATUS.suspended],
      });
      if (membership) {
        throw ApiError.badRequest("This user already belongs to the workspace");
      }
    }

    const user =
      existingUser ??
      new User({
        name: body.name,
        email,
      });
    if (!existingUser) {
      await user.save({ validateBeforeSave: false });
    }

    const rawToken = generateWorkspaceInviteToken();
    await upsertPendingWorkspaceInvite({
      workspaceId,
      email,
      name: body.name,
      role: USER_TYPE.tenant,
      invitedBy: verify.id,
      invitedUser: user._id as mongoose.Types.ObjectId,
      rawToken,
      propertyId,
      unitId,
    });

    const emailResult = await sendTeamInviteEmail({
      request,
      businessId: verify.businessId,
      to: email,
      attendeeName: body.name,
      workspaceName: business.name ?? "Workspace",
      rawToken,
    });

    if (!emailResult.sent) {
      throw ApiError.unavailable(
        emailResult.error ||
          emailResult.skippedReason ||
          "Unable to send the tenant invitation email",
      );
    }

    return NextResponse.json({
      status: "success",
      message: `Tenant invitation sent to ${email}`,
    }, { status: 201 });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
