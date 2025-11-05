import { TECHNICIAN_RESPONSE } from "@/shared/enums/enums";
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITechnicianRequest extends Document {
  ticket: Types.ObjectId;
  technician: Types.ObjectId;
  status: TECHNICIAN_RESPONSE;
  quote?: {
    total?: number;
    currency: string;
    cost: { title: string; amount: number };
  };
  schedule?: {
    start: string;
    end: string;
    day: string;
    date: Date;
  };
  reason?: string;
  message?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

type CostItem = {
  title: string;
  amount: number;
};

const CostItemSchema = new Schema<CostItem>(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  {
    _id: false, // <-- don't create _id for each array item
    id: false, // <-- don't create the virtual "id"
  }
);

const QuoteSchema = new Schema(
  {
    total: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    cost: { type: [CostItemSchema], default: [] }, // <-- use the child schema
  },
  { _id: false, id: false } // quote itself is an embedded doc; no ids needed
);

const TechnicianRequestSchema = new Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: TECHNICIAN_RESPONSE,
      default: TECHNICIAN_RESPONSE.pending,
    },
    schedule: {
      date: Date,
      start: String,
      end: String,
      day: String,
    },
    quote: { type: QuoteSchema, default: () => null },
    message: String,
    reason: String,
    scheduledDate: Date,
    respondedAt: Date,
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

TechnicianRequestSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret: Record<string, any>) {
    ret.id = ret._id?.toString();
    delete ret._id;
  },
});

TechnicianRequestSchema.pre("save", function (next) {
  if (this.quote && Array.isArray(this.quote.cost)) {
    this.quote.total = this.quote.cost.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
  } else {
    this.quote && (this.quote.total = 0);
  }
  next();
});
export const TechnicianRequest =
  mongoose.models.TechnicianRequest ||
  mongoose.model<ITechnicianRequest>(
    "TechnicianRequest",
    TechnicianRequestSchema
  );
