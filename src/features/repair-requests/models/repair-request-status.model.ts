/**
 * Lifecycle for a RepairRequest — the workspace-issued broadcast that asks
 * one or more tradespeople to quote on a ticket. Modelled on eventSphere's
 * ServiceRequest lifecycle.
 */
export const REPAIR_REQUEST_STATUS = {
  /** Tradespeople can still see the request and submit quotes. */
  OPEN: "open",
  /** A quote was accepted (Phase 3) or admin manually closed. */
  CLOSED: "closed",
  /** Admin cancelled the request. */
  CANCELLED: "cancelled",
} as const;

export type RepairRequestStatus =
  (typeof REPAIR_REQUEST_STATUS)[keyof typeof REPAIR_REQUEST_STATUS];

export const REPAIR_REQUEST_STATUS_VALUES = Object.values(REPAIR_REQUEST_STATUS);
