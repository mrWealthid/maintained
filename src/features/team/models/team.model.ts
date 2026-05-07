import { z } from "zod";
import {
  WORKSPACE_ASSIGNABLE_ROLE_VALUES,
  WORKSPACE_ROLE,
  USER_TYPE,
} from "@/shared/auth/roles";

export enum TEAM_MEMBER_STATUS {
  active = "active",
  pending = "pending",
  accepted = "accepted",
  declined = "declined",
}

export const TeamAssignableRoleSchema = z.enum(
  WORKSPACE_ASSIGNABLE_ROLE_VALUES,
);

export const TEAM_INVITE_ROLE_VALUES = [
  ...WORKSPACE_ASSIGNABLE_ROLE_VALUES,
  USER_TYPE.tenant,
  USER_TYPE.technician,
] as const;

export const TeamInviteRoleSchema = z.enum(
  TEAM_INVITE_ROLE_VALUES,
);

export const TeamInvitePayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is required")
    .max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  role: TeamInviteRoleSchema,
});

export const TeamRoleAssignmentUpdateSchema = z.union([
  z.object({
    kind: z.literal("invite"),
    role: TeamInviteRoleSchema,
  }),
  z.object({
    kind: z.literal("member"),
    role: TeamInviteRoleSchema,
  }),
  z.object({
    kind: z.literal("member"),
    roleDefinitionId: z.string().trim().min(1, "Role definition is required"),
  }),
]);

export const TeamDeactivatePayloadSchema = z.object({
  action: z.literal("deactivate"),
});

export type TeamInvitePayload = z.infer<typeof TeamInvitePayloadSchema>;
export type TeamRoleUpdatePayload = z.infer<
  typeof TeamRoleAssignmentUpdateSchema
>;
export type TeamDeactivatePayload = z.infer<typeof TeamDeactivatePayloadSchema>;
export type TeamAssignableRole = z.infer<typeof TeamAssignableRoleSchema>;
export type TeamInviteRole = z.infer<typeof TeamInviteRoleSchema>;

export type TeamListItem = {
  id: string;
  kind: "member" | "invite";
  name: string;
  email: string;
  role: WORKSPACE_ROLE | TeamInviteRole;
  roleDefinitionId?: string | null;
  roleDefinitionKey?: string | null;
  roleDefinitionName?: string | null;
  isCustomRole?: boolean;
  status: TEAM_MEMBER_STATUS;
  joinedAt: string | null;
  invitedAt: string | null;
  inviteExpiresAt: string | null;
  isInviteExpired: boolean;
  lastSentAt: string | null;
  isCurrentUser: boolean;
};

export type TeamListFilter = {
  name?: string;
  email?: string;
  search?: string;
  status?: TEAM_MEMBER_STATUS;
  role?: TeamInviteRole;
};

export type TeamListBulkAction = "resend" | "deactivate" | "delete";

export type TeamListMeta = {
  allowTeamInvitations: boolean;
  defaultRoleForNewMembers: TeamInviteRole;
  currentUserId: string;
  businessName: string;
};

export type TeamListSummary = {
  total: number;
  active: number;
  pending: number;
  accepted: number;
  declined: number;
};

export type TeamListResponse = {
  data: TeamListItem[];
  totalRecords: number;
  results: number;
  summary: TeamListSummary;
  meta: TeamListMeta;
};
