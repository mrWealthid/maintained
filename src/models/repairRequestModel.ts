import mongoose, { Schema, Model, Document, Types } from "mongoose";

import {
  TECHNICIAN_SPECIALTY_VALUES,
  type TechnicianSpecialty,
} from "@/features/technicians/models/technician-specialty.model";
import {
  REPAIR_REQUEST_STATUS,
  REPAIR_REQUEST_STATUS_VALUES,
  type RepairRequestStatus,
} from "@/features/repair-requests/models/repair-request-status.model";

/**
 * Snapshot of the diagnosis the AI produced for the ticket at broadcast time.
 * Kept in sync with `TicketTechnicianDiagnosis` in src/shared/model/model.ts.
 * Stored on each RepairRequest so a re-triage that mutates the source ticket
 * doesn't silently change what the recipients saw when they quoted.
 */
export interface IRepairRequestDiagnosisSnapshot {
  probableIssue?: string;
  inspectionPoints?: string[];
  recommendedTools?: string[];
  safetyNotes?: string[];
}

export interface IRepairRequest extends Document {
  ticket: Types.ObjectId;
  /** Owning workspace. Mirrors ticket.business so inbox queries don't join. */
  workspace: Types.ObjectId;
  /** Manager who issued the broadcast. */
  createdBy: Types.ObjectId;

  /**
   * Broadcast routing.
   *   - `specialty` set + `invitedTradespeople` empty → broadcast to any
   *     active Tradesperson whose specialties include this one.
   *   - `invitedTradespeople` non-empty → only those trades see it,
   *     regardless of specialty. (Shortlist mode.)
   *
   * One or the other must be set; both can be set (shortlist whose
   * specialty is hinted for filtering UI).
   */
  specialty?: TechnicianSpecialty;
  invitedTradespeople: Types.ObjectId[];

  /** Free-form additional context from the admin, on top of the ticket body. */
  scopeNotes?: string;

  /** Frozen snapshot of `ticket.aiTriage.technicianDiagnosis` at broadcast time. */
  technicianDiagnosis?: IRepairRequestDiagnosisSnapshot;

  status: RepairRequestStatus;
  expiresAt?: Date;
  closedAt?: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const diagnosisSnapshotSchema = new Schema<IRepairRequestDiagnosisSnapshot>(
  {
    probableIssue: { type: String, trim: true },
    inspectionPoints: { type: [String], default: [] },
    recommendedTools: { type: [String], default: [] },
    safetyNotes: { type: [String], default: [] },
  },
  { _id: false },
);

const repairRequestSchema = new Schema<IRepairRequest>(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    specialty: {
      type: String,
      enum: TECHNICIAN_SPECIALTY_VALUES,
      index: true,
    },
    invitedTradespeople: {
      type: [{ type: Schema.Types.ObjectId, ref: "Tradesperson" }],
      default: [],
      index: true,
    },

    scopeNotes: { type: String, trim: true, maxlength: 2000 },

    technicianDiagnosis: { type: diagnosisSnapshotSchema },

    status: {
      type: String,
      enum: REPAIR_REQUEST_STATUS_VALUES,
      default: REPAIR_REQUEST_STATUS.OPEN,
      index: true,
    },
    expiresAt: { type: Date },
    closedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);

// Common inbox query for tradespeople: status=open AND (specialty matches OR I'm invited).
repairRequestSchema.index({
  status: 1,
  specialty: 1,
});

// Validate routing on every save — at least one of specialty / shortlist must be set.
repairRequestSchema.pre("validate", function (next) {
  const hasSpecialty = Boolean(this.specialty);
  const hasShortlist = (this.invitedTradespeople?.length ?? 0) > 0;
  if (!hasSpecialty && !hasShortlist) {
    return next(
      new Error(
        "RepairRequest must specify a specialty (broadcast) or an invitedTradespeople list (shortlist).",
      ),
    );
  }
  next();
});

const RepairRequest: Model<IRepairRequest> =
  (mongoose.models.RepairRequest as Model<IRepairRequest>) ||
  mongoose.model<IRepairRequest>("RepairRequest", repairRequestSchema);

export default RepairRequest;
