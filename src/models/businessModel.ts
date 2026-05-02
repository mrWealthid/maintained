import { AddressStructured, USState } from "@/lib/model/model";
import { US_STATES } from "@/lib/validation/address";
import {
  DEFAULT_EMAIL_SETTINGS,
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_KEYS,
  type BusinessEmailTemplateKey,
} from "@/lib/email/defaults/default-business-email-template";
import type { EmailSettings } from "@/lib/email/models/email.model";
import { defaultBusinessSecuritySettings } from "@/lib/security/business-security";
import { CountryCode } from "libphonenumber-js";
import mongoose, { Document, Schema, Model } from "mongoose";
import validator from "validator";

export interface IBusiness extends Document {
  name: string;
  registrationId: string;
  contact: string;
  countryCode: CountryCode;

  // Legacy flat fields (kept for compatibility)
  country: string;
  address: string;

  // NEW structured address (optional — recommended to send going forward)
  addressStructured?: AddressStructured;

  description?: string;
  createdAt: Date;
  email: string;
  creator: string;
  logo?: string;
  active?: boolean;
  settings?: {
    email?: EmailSettings<BusinessEmailTemplateKey>;
    security?: {
      require2fa?: boolean;
      sessionTimeoutMinutes?: number;
      maxActiveSessions?: 1 | 3 | 5 | "unlimited";
      ipWhitelist?: {
        enabled?: boolean;
        ips?: string[];
      };
    };
  };
}

const usZipRegex = /^(?:\d{5})(?:-\d{4})?$/;

const AddressStructuredSchema = new Schema<AddressStructured>(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, uppercase: true, enum: US_STATES },
    postalCode: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => usZipRegex.test(v),
        message: "Enter a valid ZIP or ZIP+4 (e.g. 20500 or 20500-0001)",
      },
    },
    country: {
      type: String,
      required: true,
      default: "United States",
      enum: ["United States"],
    },
    placeId: { type: String, index: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    raw: Schema.Types.Mixed,
  },
  { _id: false }
);

// Geospatial index for location
AddressStructuredSchema.index({ location: "2dsphere" });

const EmailTemplateSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    subject: { type: String, required: true, trim: true },
    preheader: { type: String, default: "", trim: true },
    body: { type: String, required: true },
    delay: {
      type: String,
      enum: ["immediate", "1h", "24h", "48h", "custom"],
      default: "immediate",
    },
    customDelayMinutes: { type: Number, min: 1 },
    triggerDescription: { type: String, default: "" },
    includeUnsubscribe: { type: Boolean, default: false },
    replyToOverride: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const businessEmailTemplatesShape = EMAIL_TEMPLATE_KEYS.reduce<
  Record<
    string,
    {
      type: typeof EmailTemplateSchema;
      default: () => (typeof DEFAULT_EMAIL_TEMPLATES)[BusinessEmailTemplateKey];
    }
  >
>((templates, key) => {
  templates[key] = {
    type: EmailTemplateSchema,
    default: () => DEFAULT_EMAIL_TEMPLATES[key],
  };
  return templates;
}, {});

const EmailTemplatesSchema = new Schema(businessEmailTemplatesShape, {
  _id: false,
});

const EmailSettingsSchema = new Schema(
  {
    senderName: {
      type: String,
      default: DEFAULT_EMAIL_SETTINGS.senderName,
      trim: true,
    },
    senderEmail: {
      type: String,
      default: DEFAULT_EMAIL_SETTINGS.senderEmail,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value: string) => !value || validator.isEmail(value),
        message: "Please provide a valid sender email",
      },
    },
    replyTo: { type: String, default: DEFAULT_EMAIL_SETTINGS.replyTo, trim: true },
    bcc: { type: String, default: DEFAULT_EMAIL_SETTINGS.bcc, trim: true },
    footer: { type: String, default: DEFAULT_EMAIL_SETTINGS.footer },
    templates: {
      type: EmailTemplatesSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

const SecuritySettingsSchema = new Schema(
  {
    require2fa: {
      type: Boolean,
      default: defaultBusinessSecuritySettings.require2fa,
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: defaultBusinessSecuritySettings.sessionTimeoutMinutes,
      min: 5,
      max: 1440,
    },
    maxActiveSessions: {
      type: Schema.Types.Mixed,
      default: defaultBusinessSecuritySettings.maxActiveSessions,
    },
    ipWhitelist: {
      enabled: {
        type: Boolean,
        default: defaultBusinessSecuritySettings.ipWhitelist.enabled,
      },
      ips: {
        type: [String],
        default: () => [],
      },
    },
  },
  { _id: false }
);

const businessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true, trim: true },
    registrationId: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    countryCode: { type: String, required: true },

    // Legacy fields (still required to avoid breaking existing API/DB)
    country: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    // NEW: structured address
    addressStructured: { type: AddressStructuredSchema, required: false },

    description: { type: String },
    createdAt: { type: Date, default: Date.now },

    email: {
      type: String,
      required: [true, "Please provide your business email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    creator: { type: String, required: true },
    logo: { type: String, default: "default.jpg" },
    active: { type: Boolean, default: true },
    settings: {
      email: { type: EmailSettingsSchema, default: () => ({}) },
      security: { type: SecuritySettingsSchema, default: () => ({}) },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Helpful secondary indexes
businessSchema.index({
  "addressStructured.city": 1,
  "addressStructured.state": 1,
});
businessSchema.index({ "addressStructured.postalCode": 1 });

businessSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret: Record<string, any>) {
    ret.id = ret._id?.toString();
    delete ret._id;
  },
});

businessSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.find({ active: { $ne: false } });
  next();
});

businessSchema.virtual("businessUsers", {
  ref: "User",
  foreignField: "business",
  localField: "_id",
});

// Build a one-liner address from structured fields
function formatSingleLine(a?: {
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}) {
  if (!a) return "";
  const cityStateZip = [a.city, a.state, a.postalCode]
    .filter(Boolean)
    .join(" ");
  return [a.line1, cityStateZip].filter(Boolean).join(", ");
}

/* --------------------------- Back-compat convenience ------------------------ */
// If structured is present (or modified) but legacy `address` is empty,
// auto-fill `address` from the structured fields. Also sync flat `country`.
businessSchema.pre("validate", function (next) {
  const doc = this as mongoose.HydratedDocument<IBusiness>;
  if (
    doc.addressStructured &&
    (!doc.address || doc.isModified("addressStructured"))
  ) {
    const line = formatSingleLine(doc.addressStructured);
    if (line) doc.address = line;
    if (doc.addressStructured.country)
      doc.country = doc.addressStructured.country;
  }
  next();
});

/* --------------------------------- Export ---------------------------------- */

export const Business: Model<IBusiness> =
  mongoose.models.Business ||
  mongoose.model<IBusiness>("Business", businessSchema);
export default Business;
