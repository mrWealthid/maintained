/**
 * Top-level account taxonomy. Most users today are "managers" — they're
 * members of one or more workspaces and act on tickets, tenants, properties.
 *
 * `TRADE` is the new external-tradesperson account introduced by the
 * tradespeople rework. A TRADE user has a `Tradesperson` profile, can be
 * linked to many workspaces via `WorkspaceTrade`, but is NOT a workspace
 * member in the staff sense — they receive `RepairRequest`s and submit
 * `RepairQuote`s instead of editing workspace data.
 *
 * See TRADESPEOPLE_REWORK.md for the full plan.
 */
export const ACCOUNT_KIND = {
  MANAGER: "manager",
  TRADE: "trade",
} as const;

export type AccountKind = (typeof ACCOUNT_KIND)[keyof typeof ACCOUNT_KIND];

export const ACCOUNT_KIND_VALUES = Object.values(ACCOUNT_KIND);

export function isAccountKind(value: unknown): value is AccountKind {
  return (
    typeof value === "string" &&
    ACCOUNT_KIND_VALUES.includes(value as AccountKind)
  );
}
