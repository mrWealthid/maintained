/**
 * Lifecycle for a RepairQuote — a tradesperson's offer against a
 * RepairRequest. Status transitions:
 *
 *   submitted  ─┬─► accepted   (admin accepts → request closes, ticket assigns)
 *               ├─► declined   (admin declines OR sibling accepted)
 *               ├─► withdrawn  (tradesperson withdraws)
 *               ├─► revised    (tradesperson submits a new quote → prior superseded)
 *               └─► expired    (expiresAt passed without decision)
 */
export const REPAIR_QUOTE_STATUS = {
  SUBMITTED: "submitted",
  REVISED: "revised",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  WITHDRAWN: "withdrawn",
  EXPIRED: "expired",
} as const;

export type RepairQuoteStatus =
  (typeof REPAIR_QUOTE_STATUS)[keyof typeof REPAIR_QUOTE_STATUS];

export const REPAIR_QUOTE_STATUS_VALUES = Object.values(REPAIR_QUOTE_STATUS);

/** Statuses considered "live" for the purpose of uniqueness + sibling auto-decline. */
export const REPAIR_QUOTE_LIVE_STATUSES: RepairQuoteStatus[] = [
  REPAIR_QUOTE_STATUS.SUBMITTED,
  REPAIR_QUOTE_STATUS.ACCEPTED,
];
