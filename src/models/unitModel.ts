import mongoose, { Schema } from "mongoose";

const UnitSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    label: { type: String, required: true }, // e.g. "Apt C", "3B", "Bay-4"
    floor: String,
    isActive: { type: Boolean, default: true },

    // Current occupancy (optional)
    tenantUser: { type: Schema.Types.ObjectId, ref: "User" },
    tenantActive: { type: Boolean, default: false },

    // History
    tenants: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        start: { type: Date, default: Date.now },
        end: { type: Date },
        _id: false,
      },
    ],

    tags: [String],
  },
  { timestamps: true }
);

UnitSchema.index({ business: 1, property: 1, label: 1 }, { unique: true });
UnitSchema.index(
  { property: 1, label: 1, tenantActive: 1 },
  {
    partialFilterExpression: { tenantActive: true },
    name: "one-active-tenant-per-unit",
  }
);

export default mongoose.models.Unit || mongoose.model("Unit", UnitSchema);
