import mongoose, { Schema } from "mongoose";

export type PropertyType = "HOUSE" | "BUILDING" | "STATION";

const AddressStructured = new Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    placeId: String,
    lat: Number,
    lng: Number,
    raw: Schema.Types.Mixed,
  },
  { _id: false }
);

const PropertySchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["HOUSE", "BUILDING", "STATION"],
      required: true,
    },
    name: { type: String, required: true }, // e.g. "2333 Chestnut Street"
    code: { type: String }, // optional short code
    address: AddressStructured,
    propertyAddress: { type: String },
    isActive: { type: Boolean, default: true },
    defaultUnit: { type: Schema.Types.ObjectId, ref: "Unit", index: true },
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

PropertySchema.index({ business: 1, name: 1 }, { unique: true });

export default mongoose.models.Property ||
  mongoose.model("Property", PropertySchema);
