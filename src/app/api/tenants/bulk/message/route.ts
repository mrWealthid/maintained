import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { WORKSPACE_INVITE_STATUS } from "@/lib/tenancy/model";
import { sendBulkAudienceMessage } from "@/lib/email/senders/audience/send-bulk-audience-message";
import User from "@/models/userModel";
import WorkspaceInvite from "@/models/workspaceInviteModel";
import WorkspaceMembership from "@/models/workspaceMembershipModel";
import { MEMBERSHIP_STATUS, USER_TYPE } from "@/shared/auth/roles";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { AudienceMessageContentSchema } from "@/shared/model/audience-message.model";

const BulkTenantMessageSchema = AudienceMessageContentSchema.extend({
  tenantIds: z.array(z.string().min(1)).min(1).max(200),
}).strict();

type Recipient = {
  id: string;
  name: string;
  email: string;
};

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

function toObjectIds(ids: string[]) {
  return ids.map((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("One or more selected tenants are invalid");
    }
    return new mongoose.Types.ObjectId(id);
  });
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    await assertWorkspacePermissionKey(verify, PERMISSION.TENANTS_MESSAGE);

    const body = parseOrThrow(BulkTenantMessageSchema, await request.json());
    const tenantIds = Array.from(new Set(body.tenantIds));
    const objectIds = toObjectIds(tenantIds);
    const workspaceId = new mongoose.Types.ObjectId(verify.businessId);

    const [memberships, invites] = await Promise.all([
      WorkspaceMembership.find({
        workspace: workspaceId,
        role: USER_TYPE.tenant,
        status: MEMBERSHIP_STATUS.active,
        user: { $in: objectIds },
      })
        .select("user")
        .lean(),
      WorkspaceInvite.find({
        _id: { $in: objectIds },
        workspace: workspaceId,
        role: USER_TYPE.tenant,
        status: WORKSPACE_INVITE_STATUS.pending,
      })
        .select("name email")
        .lean(),
    ]);

    const memberUserIds = memberships.map(
      (membership) => membership.user as mongoose.Types.ObjectId,
    );
    const users = memberUserIds.length
      ? await User.find({
          _id: { $in: memberUserIds },
          active: { $ne: false },
        })
          .select("name email")
          .lean()
      : [];

    const recipients: Recipient[] = [
      ...users.flatMap((user) =>
        user.email
          ? [
              {
                id: String(user._id),
                name: user.name || "Tenant",
                email: user.email,
              },
            ]
          : [],
      ),
      ...invites.flatMap((invite) =>
        invite.email
          ? [
              {
                id: String(invite._id),
                name: invite.name || "Tenant",
                email: invite.email,
              },
            ]
          : [],
      ),
    ];

    if (recipients.length !== tenantIds.length) {
      throw ApiError.notFound("Some selected tenants could not be found");
    }

    const result = await sendBulkAudienceMessage({
      businessId: verify.businessId,
      audienceLabel: "selected tenant contacts",
      composeMode: body.composeMode,
      subject: body.subject,
      message: body.message,
      recipients,
    });

    if (result.successCount === 0) {
      throw ApiError.unavailable("Unable to send tenant messages");
    }

    return NextResponse.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
