import type mongoose from "mongoose";

import WorkspaceMembership from "@/models/workspaceMembershipModel";
import {
  MEMBERSHIP_STATUS,
  WORKSPACE_ROLE,
  type MembershipStatus,
} from "@/shared/auth/roles";

type ObjectIdLike = mongoose.Types.ObjectId | string;

export function findActiveWorkspaceMembership(args: {
  userId: ObjectIdLike;
  workspaceId: ObjectIdLike;
  session?: mongoose.ClientSession | null;
}) {
  const query = WorkspaceMembership.findOne({
    user: args.userId,
    workspace: args.workspaceId,
    status: MEMBERSHIP_STATUS.active,
  }).select("workspace user role roleDefinition status joinedAt specialties property unit");

  if (args.session) query.session(args.session);
  return query;
}

export function findFirstActiveWorkspaceMembership(args: {
  userId: ObjectIdLike;
  session?: mongoose.ClientSession | null;
}) {
  const query = WorkspaceMembership.findOne({
    user: args.userId,
    status: MEMBERSHIP_STATUS.active,
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .select("workspace user role roleDefinition status joinedAt specialties property unit");

  if (args.session) query.session(args.session);
  return query;
}

export function listActiveWorkspaceMemberships(args: {
  userId: ObjectIdLike;
  session?: mongoose.ClientSession | null;
}) {
  const query = WorkspaceMembership.find({
    user: args.userId,
    status: MEMBERSHIP_STATUS.active,
  })
    .select("workspace user role roleDefinition status joinedAt updatedAt specialties property unit")
    .sort({ updatedAt: -1, createdAt: -1 });

  if (args.session) query.session(args.session);
  return query;
}

export function listWorkspaceMembershipsByWorkspace(args: {
  workspaceId: ObjectIdLike;
  statuses?: MembershipStatus[];
  session?: mongoose.ClientSession | null;
}) {
  const query = WorkspaceMembership.find({
    workspace: args.workspaceId,
    status: {
      $in: args.statuses ?? [MEMBERSHIP_STATUS.active],
    },
  }).select("workspace user role roleDefinition status joinedAt createdBy updatedAt specialties property unit");

  if (args.session) query.session(args.session);
  return query;
}

export function findWorkspaceMembershipByUser(args: {
  workspaceId: ObjectIdLike;
  userId: ObjectIdLike;
  statuses?: MembershipStatus[];
  session?: mongoose.ClientSession | null;
}) {
  const query = WorkspaceMembership.findOne({
    workspace: args.workspaceId,
    user: args.userId,
    status: {
      $in: args.statuses ?? [MEMBERSHIP_STATUS.active],
    },
  }).select("workspace user role roleDefinition status joinedAt createdBy updatedAt specialties property unit");

  if (args.session) query.session(args.session);
  return query;
}

export async function countActiveWorkspaceAdmins(args: {
  workspaceId: ObjectIdLike;
  excludedUserId?: ObjectIdLike | null;
}) {
  const filter: Record<string, unknown> = {
    workspace: args.workspaceId,
    status: MEMBERSHIP_STATUS.active,
    role: {
      $in: [WORKSPACE_ROLE.owner, WORKSPACE_ROLE.property_manager],
    },
  };

  if (args.excludedUserId) {
    filter.user = { $ne: args.excludedUserId };
  }

  return WorkspaceMembership.countDocuments(filter);
}

export function deleteWorkspaceMembership(args: {
  workspaceId: ObjectIdLike;
  userId: ObjectIdLike;
  session?: mongoose.ClientSession | null;
}) {
  const query = WorkspaceMembership.deleteOne({
    workspace: args.workspaceId,
    user: args.userId,
  });

  if (args.session) query.session(args.session);
  return query;
}
