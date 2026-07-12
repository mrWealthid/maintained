/**
 * Status enums for the Tradesperson identity and the WorkspaceTrade
 * relationship between a tradesperson and a workspace.
 */

export const TRADE_VERIFICATION_STATUS = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
  SUSPENDED: "suspended",
} as const;

export type TradeVerificationStatus =
  (typeof TRADE_VERIFICATION_STATUS)[keyof typeof TRADE_VERIFICATION_STATUS];

export const TRADE_VERIFICATION_STATUS_VALUES = Object.values(
  TRADE_VERIFICATION_STATUS,
);

/** Wizard step the trade is currently on. `completedAt` gates the dashboard. */
export const TRADE_ONBOARDING_STEP = {
  BASICS: "basics",
  SPECIALTIES: "specialties",
  AREA: "area",
  REVIEW: "review",
} as const;

export type TradeOnboardingStep =
  (typeof TRADE_ONBOARDING_STEP)[keyof typeof TRADE_ONBOARDING_STEP];

export const TRADE_ONBOARDING_STEP_VALUES = Object.values(TRADE_ONBOARDING_STEP);

/** Status of a tradesperson's link to a specific workspace. */
export const WORKSPACE_TRADE_STATUS = {
  /** Workspace has emailed the trade but the trade hasn't accepted yet. */
  INVITED: "invited",
  /** Trade has accepted the workspace link and can receive RepairRequests. */
  ACTIVE: "active",
  /** Workspace temporarily disabled the link (no broadcasts, no requests). */
  SUSPENDED: "suspended",
} as const;

export type WorkspaceTradeStatus =
  (typeof WORKSPACE_TRADE_STATUS)[keyof typeof WORKSPACE_TRADE_STATUS];

export const WORKSPACE_TRADE_STATUS_VALUES = Object.values(WORKSPACE_TRADE_STATUS);
