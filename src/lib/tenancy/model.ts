export const WORKSPACE_INVITE_STATUS = {
  pending: "PENDING",
  accepted: "ACCEPTED",
  declined: "DECLINED",
  revoked: "REVOKED",
  expired: "EXPIRED",
} as const;

export type WorkspaceInviteStatus =
  (typeof WORKSPACE_INVITE_STATUS)[keyof typeof WORKSPACE_INVITE_STATUS];

export const WORKSPACE_INVITE_STATUS_VALUES = Object.values(
  WORKSPACE_INVITE_STATUS,
);

export const WORKSPACE_MEMBERSHIP_SOURCE = {
  signup: "SIGNUP",
  workspace_create: "WORKSPACE_CREATE",
  invite: "INVITE",
  admin_attach: "ADMIN_ATTACH",
  seed: "SEED",
} as const;

export type WorkspaceMembershipSource =
  (typeof WORKSPACE_MEMBERSHIP_SOURCE)[keyof typeof WORKSPACE_MEMBERSHIP_SOURCE];
