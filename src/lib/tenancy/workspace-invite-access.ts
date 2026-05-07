import type mongoose from "mongoose";

import WorkspaceInvite from "@/models/workspaceInviteModel";
import { WORKSPACE_INVITE_STATUS } from "@/lib/tenancy/model";
import { hashWorkspaceInviteToken } from "@/lib/tenancy/invites";
import type { WorkspaceInviteRole } from "@/models/workspaceInviteModel";

type ObjectIdLike = mongoose.Types.ObjectId | string;

type WorkspaceInviteUserSnapshot = {
  password?: string | null;
} | null | undefined;

export function resolveWorkspaceInviteRequiresAccountSetup(
  user?: WorkspaceInviteUserSnapshot,
) {
  return !user?.password;
}

export function buildPendingWorkspaceInviteTokenQuery(rawToken: string) {
  return {
    tokenHash: hashWorkspaceInviteToken(rawToken),
    status: WORKSPACE_INVITE_STATUS.pending,
    tokenExpiresAt: { $gt: new Date() },
  };
}

export function findPendingWorkspaceInviteByRawToken(args: {
  rawToken: string;
  session?: mongoose.ClientSession | null;
}) {
  const query = WorkspaceInvite.findOne(
    buildPendingWorkspaceInviteTokenQuery(args.rawToken),
  );

  if (args.session) {
    query.session(args.session);
  }

  return query;
}

export function findPendingWorkspaceInviteForWorkspaceSubject(args: {
  workspaceId: ObjectIdLike;
  invitedUserId?: ObjectIdLike | null;
  email?: string | null;
  session?: mongoose.ClientSession | null;
}) {
  const orConditions: Array<Record<string, unknown>> = [];

  if (args.invitedUserId) {
    orConditions.push({ invitedUser: args.invitedUserId });
  }

  if (args.email?.trim()) {
    orConditions.push({ email: args.email.toLowerCase().trim() });
  }

  if (!orConditions.length) {
    return null;
  }

  const query = WorkspaceInvite.findOne({
    workspace: args.workspaceId,
    status: WORKSPACE_INVITE_STATUS.pending,
    $or: orConditions,
  });

  if (args.session) {
    query.session(args.session);
  }

  return query;
}

export async function acceptWorkspaceInviteRecord(args: {
  inviteId: ObjectIdLike;
  acceptedBy: ObjectIdLike;
  session?: mongoose.ClientSession | null;
  acceptedAt?: Date;
}) {
  const acceptedAt = args.acceptedAt ?? new Date();

  return WorkspaceInvite.findByIdAndUpdate(
    args.inviteId,
    {
      $set: {
        status: WORKSPACE_INVITE_STATUS.accepted,
        acceptedAt,
        acceptedBy: args.acceptedBy,
      },
      $unset: {
        tokenHash: 1,
        tokenExpiresAt: 1,
      },
    },
    {
      new: true,
      session: args.session ?? undefined,
    },
  );
}

export async function updatePendingWorkspaceInviteRole(args: {
  inviteId: ObjectIdLike;
  role: WorkspaceInviteRole;
  session?: mongoose.ClientSession | null;
}) {
  return WorkspaceInvite.findByIdAndUpdate(
    args.inviteId,
    {
      $set: {
        role: args.role,
      },
    },
    {
      new: true,
      session: args.session ?? undefined,
      runValidators: true,
    },
  );
}

export async function revokePendingWorkspaceInvite(args: {
  inviteId: ObjectIdLike;
  session?: mongoose.ClientSession | null;
  revokedAt?: Date;
}) {
  return WorkspaceInvite.findByIdAndUpdate(
    args.inviteId,
    {
      $set: {
        status: WORKSPACE_INVITE_STATUS.revoked,
        revokedAt: args.revokedAt ?? new Date(),
      },
      $unset: {
        tokenHash: 1,
        tokenExpiresAt: 1,
      },
    },
    {
      new: true,
      session: args.session ?? undefined,
    },
  );
}
