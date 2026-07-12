import mongoose, { Schema, Model, Document, Types } from "mongoose";

import {
  WORKSPACE_TRADE_STATUS,
  WORKSPACE_TRADE_STATUS_VALUES,
  type WorkspaceTradeStatus,
} from "@/features/trades/models/trade-status.model";

export interface IWorkspaceTrade extends Document {
  /** The workspace (Business) that linked this tradesperson. */
  workspace: Types.ObjectId;
  /** The tradesperson identity (global). */
  tradesperson: Types.ObjectId;
  /** The manager who created the link (typically the inviter). */
  addedBy: Types.ObjectId;

  status: WorkspaceTradeStatus;

  /**
   * Pre-acceptance invite token. Set when status==='invited', consumed and
   * cleared when status flips to 'active' via /api/trades/invite/accept.
   * Kept as a single token (not a list) because each workspace-trade pair is
   * unique — re-inviting a trade rotates the token in place.
   */
  inviteToken?: string;
  inviteTokenExpires?: Date;
  /** Email the invite was sent to (so the trade can sign up if they don't have an account yet). */
  invitedEmail?: string;

  /** Optional saved rate the workspace expects to pay this trade. */
  trustedRate?: {
    amountCents: number;
    currency: string;
    /** "hourly" or "visit" — billed unit. */
    unit: "hourly" | "visit";
  };

  createdAt: Date;
  updatedAt: Date;
}

const trustedRateSchema = new Schema(
  {
    amountCents: { type: Number, min: 0, required: true },
    currency: { type: String, default: "USD", uppercase: true },
    unit: { type: String, enum: ["hourly", "visit"], required: true },
  },
  { _id: false },
);

const workspaceTradeSchema = new Schema<IWorkspaceTrade>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    tradesperson: {
      type: Schema.Types.ObjectId,
      ref: "Tradesperson",
      required: true,
      index: true,
    },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: WORKSPACE_TRADE_STATUS_VALUES,
      default: WORKSPACE_TRADE_STATUS.INVITED,
      index: true,
    },

    inviteToken: { type: String, index: true },
    inviteTokenExpires: { type: Date },
    invitedEmail: { type: String, lowercase: true, trim: true },

    trustedRate: { type: trustedRateSchema },
  },
  { timestamps: true },
);

// One link per (workspace, tradesperson). Re-inviting updates the same row.
workspaceTradeSchema.index(
  { workspace: 1, tradesperson: 1 },
  { unique: true },
);

const WorkspaceTrade: Model<IWorkspaceTrade> =
  (mongoose.models.WorkspaceTrade as Model<IWorkspaceTrade>) ||
  mongoose.model<IWorkspaceTrade>("WorkspaceTrade", workspaceTradeSchema);

export default WorkspaceTrade;
