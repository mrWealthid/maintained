import type mongoose from "mongoose";

import { resolveWorkspaceRoleDefinitionId } from "@/lib/auth/role-definitions";
import WorkspaceMembership from "@/models/workspaceMembershipModel";
import { MEMBERSHIP_STATUS, WORKSPACE_ROLE } from "@/shared/auth/roles";
import type { MembershipRole } from "@/models/userModel";
import type { WorkspaceMembershipSource } from "@/lib/tenancy/model";

type ObjectIdLike = mongoose.Types.ObjectId | string;

export async function upsertActiveWorkspaceMembership(args: {
  session?: mongoose.ClientSession | null;
  workspaceId: ObjectIdLike;
  userId: ObjectIdLike;
  role: MembershipRole;
  roleDefinition?: ObjectIdLike | null;
  createdBy?: ObjectIdLike | null;
  source: WorkspaceMembershipSource;
  joinedAt?: Date;
  specialties?: string[];
  property?: ObjectIdLike | null;
  unit?: ObjectIdLike | null;
}) {
  const roleDefinition =
    args.roleDefinition ??
    (Object.values(WORKSPACE_ROLE).includes(args.role as WORKSPACE_ROLE)
      ? await resolveWorkspaceRoleDefinitionId({
          workspaceId: args.workspaceId,
          role: args.role as WORKSPACE_ROLE,
          options: {
            session: args.session,
            createdBy: args.createdBy,
          },
        })
      : null);

  return WorkspaceMembership.findOneAndUpdate(
    {
      workspace: args.workspaceId,
      user: args.userId,
    },
    {
      $set: {
        role: args.role,
        roleDefinition,
        status: MEMBERSHIP_STATUS.active,
        joinedAt: args.joinedAt ?? new Date(),
        specialties: args.specialties?.length ? args.specialties : undefined,
        property: args.property ?? null,
        unit: args.unit ?? null,
      },
      $setOnInsert: {
        workspace: args.workspaceId,
        user: args.userId,
        createdBy: args.createdBy ?? null,
        source: args.source,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      session: args.session ?? undefined,
    },
  );
}
