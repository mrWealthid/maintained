import mongoose, { Schema, Model, Document, Types } from "mongoose";

import {
  REPAIR_QUOTE_STATUS,
  REPAIR_QUOTE_STATUS_VALUES,
  type RepairQuoteStatus,
} from "@/features/repair-quotes/models/repair-quote-status.model";

export interface IRepairQuoteLineItem {
  label: string;
  amountCents: number;
  /** Defaults to 1 — multiplied by amountCents for the line total. */
  quantity: number;
}

export interface IRepairQuoteScheduleProposal {
  /** Earliest the trade can start work. */
  earliestStart?: Date;
  /** Estimated job length in hours; used by admin comparison UI. */
  durationHours?: number;
}

export interface IRepairQuote extends Document {
  repairRequest: Types.ObjectId;
  tradesperson: Types.ObjectId;

  /**
   * Gross amount in cents. Computed pre-save from `lineItems` if items are
   * present, otherwise trusted as-is. No platform fee — Stripe Connect is
   * out of scope for the maintain rework (see TRADESPEOPLE_REWORK.md).
   */
  amountCents: number;
  currency: string;

  lineItems: IRepairQuoteLineItem[];
  scheduleProposal?: IRepairQuoteScheduleProposal;

  /** Free-form payment / scope terms shown to the admin. */
  terms?: string;
  /** Trade-stated workmanship warranty in days. */
  warrantyDays?: number;
  /** If unset, the quote stays live indefinitely (until accepted/declined). */
  expiresAt?: Date;

  status: RepairQuoteStatus;

  /**
   * Revision chain. When a trade submits a new quote against a request they
   * already have a live quote on, the prior quote flips to `revised` and the
   * new one's `parentQuote` points back at it.
   */
  parentQuote?: Types.ObjectId;

  submittedAt: Date;
  decidedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const lineItemSchema = new Schema<IRepairQuoteLineItem>(
  {
    label: { type: String, required: true, trim: true, maxlength: 200 },
    amountCents: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1, max: 1000 },
  },
  { _id: false },
);

const scheduleProposalSchema = new Schema<IRepairQuoteScheduleProposal>(
  {
    earliestStart: { type: Date },
    durationHours: { type: Number, min: 0, max: 24 * 90 },
  },
  { _id: false },
);

const repairQuoteSchema = new Schema<IRepairQuote>(
  {
    repairRequest: {
      type: Schema.Types.ObjectId,
      ref: "RepairRequest",
      required: true,
      index: true,
    },
    tradesperson: {
      type: Schema.Types.ObjectId,
      ref: "Tradesperson",
      required: true,
      index: true,
    },

    amountCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true },

    lineItems: { type: [lineItemSchema], default: [] },
    scheduleProposal: { type: scheduleProposalSchema },

    terms: { type: String, trim: true, maxlength: 4000 },
    warrantyDays: { type: Number, min: 0, max: 365 * 10 },
    expiresAt: { type: Date, index: true },

    status: {
      type: String,
      enum: REPAIR_QUOTE_STATUS_VALUES,
      default: REPAIR_QUOTE_STATUS.SUBMITTED,
      index: true,
    },

    parentQuote: {
      type: Schema.Types.ObjectId,
      ref: "RepairQuote",
    },

    submittedAt: { type: Date, default: () => new Date() },
    decidedAt: { type: Date },
  },
  { timestamps: true },
);

// At most one *live* quote per (request, tradesperson) — partial unique index.
// `revised | declined | withdrawn | expired` are excluded so the chain can grow.
repairQuoteSchema.index(
  { repairRequest: 1, tradesperson: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [REPAIR_QUOTE_STATUS.SUBMITTED, REPAIR_QUOTE_STATUS.ACCEPTED] },
    },
  },
);

// Pre-save: if line items are present, recompute amountCents from them so the
// admin can't trust a stale total. If lineItems is empty the supplied
// amountCents stays as-is (lump-sum quotes are allowed).
repairQuoteSchema.pre("save", function (next) {
  if (Array.isArray(this.lineItems) && this.lineItems.length > 0) {
    const total = this.lineItems.reduce(
      (sum, item) =>
        sum + (item.amountCents ?? 0) * (item.quantity ?? 1),
      0,
    );
    this.amountCents = total;
  }
  next();
});

const RepairQuote: Model<IRepairQuote> =
  (mongoose.models.RepairQuote as Model<IRepairQuote>) ||
  mongoose.model<IRepairQuote>("RepairQuote", repairQuoteSchema);

export default RepairQuote;
