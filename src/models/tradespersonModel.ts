import mongoose, { Schema, Model, Document, Types } from "mongoose";

import {
  TECHNICIAN_SPECIALTY_VALUES,
  type TechnicianSpecialty,
} from "@/features/technicians/models/technician-specialty.model";
import {
  TRADE_ONBOARDING_STEP_VALUES,
  TRADE_VERIFICATION_STATUS,
  TRADE_VERIFICATION_STATUS_VALUES,
  type TradeOnboardingStep,
  type TradeVerificationStatus,
} from "@/features/trades/models/trade-status.model";

export interface ITradespersonOnboarding {
  completedAt?: Date;
  lastStep?: TradeOnboardingStep;
}

export interface ITradesperson extends Document {
  /**
   * Identity is global — a tradesperson is not scoped to a workspace.
   * `userId` is the User who owns this profile; that User has
   * `accountKind: TRADE`. The same person can later be linked to many
   * workspaces via `WorkspaceTrade`.
   */
  userId: Types.ObjectId;
  /** Trading-as / business name displayed to workspaces and on quotes. */
  businessName: string;
  /** Unique, immutable, lower-kebab identifier used in URLs and emails. */
  slug: string;
  contactEmail: string;
  contactPhone?: string;
  description?: string;
  logo?: string;

  /** Trades the person performs — drives broadcast routing in Phase 2. */
  specialties: TechnicianSpecialty[];

  /** Free-form single-line address derived from the structured address. */
  address?: string;
  /** Structured address (Google Places-backed when present). */
  addressStructured?: Record<string, unknown>;
  /** How far from `address` the trade is willing to travel. */
  serviceAreaKm?: number;

  verificationStatus: TradeVerificationStatus;
  isActive: boolean;

  /** Onboarding completion state. `completedAt` gates `/trades` access. */
  onboarding?: ITradespersonOnboarding;

  createdAt: Date;
  updatedAt: Date;
}

const onboardingSchema = new Schema<ITradespersonOnboarding>(
  {
    completedAt: { type: Date },
    lastStep: { type: String, enum: TRADE_ONBOARDING_STEP_VALUES },
  },
  { _id: false },
);

const tradespersonSchema = new Schema<ITradesperson>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    businessName: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      lowercase: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    contactPhone: { type: String, trim: true },
    description: { type: String, trim: true },
    logo: { type: String, trim: true },

    specialties: {
      type: [{ type: String, enum: TECHNICIAN_SPECIALTY_VALUES }],
      default: [],
      index: true,
    },

    address: { type: String, trim: true },
    addressStructured: { type: Schema.Types.Mixed },
    serviceAreaKm: { type: Number, min: 0 },

    verificationStatus: {
      type: String,
      enum: TRADE_VERIFICATION_STATUS_VALUES,
      default: TRADE_VERIFICATION_STATUS.UNVERIFIED,
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },

    onboarding: { type: onboardingSchema, default: () => ({}) },
  },
  { timestamps: true },
);

tradespersonSchema.index({
  isActive: 1,
  verificationStatus: 1,
  specialties: 1,
});

// A trade with no specialties is functionally invisible — broadcast routing
// filters by `specialty: { $in: [...trade.specialties] }`, so an empty list
// means they never see any work. Enforce ≥1 specialty at the model level
// so signup, invite acceptance, profile edits and migration all fail-fast.
tradespersonSchema.pre("validate", function (next) {
  if (!Array.isArray(this.specialties) || this.specialties.length === 0) {
    return next(
      new Error(
        "Tradesperson.specialties must contain at least one specialty",
      ),
    );
  }
  next();
});

const Tradesperson: Model<ITradesperson> =
  (mongoose.models.Tradesperson as Model<ITradesperson>) ||
  mongoose.model<ITradesperson>("Tradesperson", tradespersonSchema);

export default Tradesperson;
