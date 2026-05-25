import mongoose, { Document, Schema, Model } from "mongoose";
import type { ObjectId } from "mongoose";
import Business from "./businessModel";
import User from "./userModel";
import Category from "./ticketCategoryModel";
import {
  AI_TRIAGE_SOURCE,
  AI_TRIAGE_STATUS,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "@/shared/enums/enums";
import "./technicanRequest";

export interface LocationSnapshot {
  propertyName?: string;
  unitLabel?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
}

export interface TicketTechnicianDiagnosisSnapshot {
  probableIssue?: string;
  inspectionPoints?: string[];
  recommendedTools?: string[];
  safetyNotes?: string[];
}

export interface TicketAiTriage {
  priorityReason?: string;
  isMinorFix?: boolean;
  requiresTechnician?: boolean;
  immediateActionRequired?: boolean;
  safetyInstructions?: string[];
  userTroubleshootingSteps?: string[];
  technicianDiagnosis?: TicketTechnicianDiagnosisSnapshot | null;
  userReply?: string;
  routeTo?: string;
  confidenceScore?: number;
  needsHumanReview?: boolean;
  missingInformation?: string[];
  safetyRisk?: "Low" | "Medium" | "High";
  riskType?: string[];
  adminNotes?: string;
  estimatedResponseWindow?: string;
  analyzedAt?: Date;
  analyzedBy?: string;
}

export interface ITicket extends Document {
  title: string;
  area: string;
  description: string;
  category: ObjectId;
  status: TICKET_STATUS;
  videos: string[];
  images: string[];
  documents: string[]; // Optional for documents
  createdAt: Date;
  user: ObjectId;
  business: ObjectId;
  actionedBy: ObjectId;
  assignedTo?: ObjectId;
  relatedTo?: ObjectId;
  type: ObjectId;
  priority: TICKET_PRIORITY;
  aiTriageStatus: AI_TRIAGE_STATUS;
  aiTriage?: TicketAiTriage;
  aiTriageStartedAt?: Date;
  aiTriageCompletedAt?: Date;
  aiTriageFailedAt?: Date;
  aiTriageError?: string;
  aiTriageRunId?: string;
  aiTriageRetryCount?: number;
  aiTriageSource?: AI_TRIAGE_SOURCE;
  aiTriageVersion?: string;
  dueDate?: Date;
  completedAt?: Date;
  closedAt?: Date;

  // NEW — location linkage + denorm labels + snapshot
  property: ObjectId;
  unit: ObjectId;
  propertyName?: string;
  unitLabel?: string;
  locationSnapshot?: LocationSnapshot;
}

const allowedTransitions: Record<string, string[]> = {
  PENDING: ["PROCESSING", "DECLINED"],
  PROCESSING: ["PENDING_ASSIGNMENT", "PENDING", "DECLINED"],
  PENDING_ASSIGNMENT: ["ASSIGNED", "PROCESSING", "DECLINED"],
  ASSIGNED: ["SCHEDULED", "DECLINED"],
  SCHEDULED: ["COMPLETED", "DECLINED"],
  DECLINED: [],
  COMPLETED: [],
};

const TicketTechnicianDiagnosisSchema =
  new Schema<TicketTechnicianDiagnosisSnapshot>(
    {
      probableIssue: { type: String },
      inspectionPoints: { type: [String], default: undefined },
      recommendedTools: { type: [String], default: undefined },
      safetyNotes: { type: [String], default: undefined },
    },
    { _id: false, id: false },
  );

const TicketAiTriageSchema = new Schema<TicketAiTriage>(
  {
    priorityReason: { type: String },
    isMinorFix: { type: Boolean },
    requiresTechnician: { type: Boolean },
    immediateActionRequired: { type: Boolean },
    safetyInstructions: { type: [String], default: undefined },
    userTroubleshootingSteps: { type: [String], default: undefined },
    technicianDiagnosis: {
      type: TicketTechnicianDiagnosisSchema,
      default: undefined,
    },
    userReply: { type: String },
    routeTo: { type: String },
    confidenceScore: { type: Number, min: 0, max: 1 },
    needsHumanReview: { type: Boolean },
    missingInformation: { type: [String], default: undefined },
    safetyRisk: { type: String, enum: ["Low", "Medium", "High"] },
    riskType: { type: [String], default: undefined },
    adminNotes: { type: String },
    estimatedResponseWindow: { type: String },
    analyzedAt: { type: Date },
    analyzedBy: { type: String },
  },
  { _id: false, id: false },
);

const TicketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true },
    area: { type: String, required: true },
    description: { type: String, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Category,
      required: [true, "Request must belong to a category"],
    },

    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketType",
      required: true,
    },

    status: {
      type: String,
      enum: TICKET_STATUS,
      default: TICKET_STATUS.pending,
    },

    videos: [{ type: String }],
    images: [{ type: String }],
    documents: [{ type: String }],

    createdAt: {
      type: Date,
      default: Date.now,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: [true, "Request must belong to a User"],
    },

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Business,
      required: [true, "Request must belong to a business"],
    },

    actionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },

    relatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
      index: true,
    },

    priority: {
      type: String,
      enum: TICKET_PRIORITY,
      default: TICKET_PRIORITY.medium,
    },
    aiTriageStatus: {
      type: String,
      enum: Object.values(AI_TRIAGE_STATUS),
      default: AI_TRIAGE_STATUS.notStarted,
      index: true,
    },
    aiTriage: {
      type: TicketAiTriageSchema,
      default: undefined,
    },
    aiTriageStartedAt: { type: Date },
    aiTriageCompletedAt: { type: Date },
    aiTriageFailedAt: { type: Date },
    aiTriageError: { type: String },
    aiTriageRunId: { type: String },
    aiTriageRetryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    aiTriageSource: {
      type: String,
      enum: Object.values(AI_TRIAGE_SOURCE),
    },
    aiTriageVersion: { type: String },

    // Lifecycle dates — useful for SLA/reporting
    dueDate: { type: Date },
    completedAt: { type: Date },
    closedAt: { type: Date },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Request must belong to a property"],
      index: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Request must belong to a unit"],
      index: true,
    },

    // Denormalized labels for fast list rendering
    propertyName: { type: String },
    unitLabel: { type: String },

    // Immutable snapshot (optional but helpful: keeps address stable over time)
    locationSnapshot: {
      propertyName: String,
      unitLabel: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        lat: Number,
        lng: Number,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

TicketSchema.index({ business: 1, property: 1, unit: 1, createdAt: -1 });
TicketSchema.index({ business: 1, relatedTo: 1, createdAt: -1 });

TicketSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret: Record<string, any>) {
    ret.id = ret._id?.toString();
    delete ret._id;
  },
});

TicketSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;
  if (!update.status) return next();

  const docToUpdate = await this.model.findOne(this.getQuery());
  const oldStatus = docToUpdate?.status;
  const newStatus = update.status;

  const allowed =
    allowedTransitions[oldStatus as keyof typeof allowedTransitions] || [];

  if (!allowed.includes(newStatus)) {
    return next(
      new Error(
        `Invalid status transition from '${oldStatus}' to '${newStatus}'`
      )
    );
  }
  next();
});

TicketSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  try {
    const Unit = (await import("./unitModel")).default;
    const Property = (await import("./propertyModel")).default;

    const unit = await Unit.findById(this.unit).lean();
    const prop = await Property.findById(this.property).lean();
    if (!unit || Array.isArray(unit) || !prop || Array.isArray(prop)) {
      return next(new Error("Invalid property/unit"));
    }

    this.propertyName = prop.name;
    this.unitLabel = unit.label;

    if (prop.address) {
      this.locationSnapshot = {
        propertyName: prop.name,
        unitLabel: unit.label,
        address: prop.address,
      };
    }
    next();
  } catch (e: any) {
    next(e);
  }
});

TicketSchema.virtual("requests", {
  ref: "TechnicianRequest",
  foreignField: "ticket",
  localField: "_id",
});

const Ticket =
  (mongoose.models.Ticket as Model<ITicket>) ||
  mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;

// businessSchema.virtual('businessUsers', {
// 	ref: 'User',
// 	foreignField: 'business',
// 	localField: '_id'
// });
