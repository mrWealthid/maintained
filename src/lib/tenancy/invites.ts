import { createHash, randomBytes } from "crypto";
import type mongoose from "mongoose";

import WorkspaceInvite, {
  type WorkspaceInviteRole,
} from "@/models/workspaceInviteModel";
import { WORKSPACE_INVITE_STATUS } from "@/lib/tenancy/model";
import { getInviteTokenExpiresInHours } from "@/utils/helpers";

type ObjectIdLike = mongoose.Types.ObjectId | string;

export function hashWorkspaceInviteToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function generateWorkspaceInviteToken() {
  return randomBytes(32).toString("hex");
}

export async function upsertPendingWorkspaceInvite(args: {
  session?: mongoose.ClientSession | null;
  workspaceId: ObjectIdLike;
  email: string;
  name: string;
  role: WorkspaceInviteRole;
  specialties?: string[];
  propertyId?: ObjectIdLike | null;
  unitId?: ObjectIdLike | null;
  invitedBy: ObjectIdLike;
  rawToken: string;
  invitedUser?: ObjectIdLike | null;
  sentAt?: Date;
}) {
  const email = args.email.toLowerCase().trim();
  const sentAt = args.sentAt ?? new Date();
  const tokenHash = hashWorkspaceInviteToken(args.rawToken);
  const tokenExpiresAt = new Date(
    sentAt.getTime() + getInviteTokenExpiresInHours() * 60 * 60 * 1000,
  );

  return WorkspaceInvite.findOneAndUpdate(
    {
      workspace: args.workspaceId,
      email,
      status: WORKSPACE_INVITE_STATUS.pending,
    },
    {
      $set: {
        name: args.name,
        role: args.role,
        specialties: args.specialties?.length ? args.specialties : undefined,
        property: args.propertyId ?? null,
        unit: args.unitId ?? null,
        invitedBy: args.invitedBy,
        invitedUser: args.invitedUser ?? null,
        tokenHash,
        tokenExpiresAt,
        invitedAt: sentAt,
        lastSentAt: sentAt,
        acceptedAt: null,
        declinedAt: null,
        revokedAt: null,
        acceptedBy: null,
      },
      $setOnInsert: {
        workspace: args.workspaceId,
        email,
        status: WORKSPACE_INVITE_STATUS.pending,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      session: args.session ?? undefined,
    },
  );
}
