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
import {
  WORKSPACE_TYPE,
  WORKSPACE_TYPE_VALUES,
  type WorkspaceType,
} from "@/shared/model/workspace.model";

export interface IBusiness extends Document {
  name: string;
  registrationId?: string;
  contact: string;
  countryCode: CountryCode;
  workspaceType: WorkspaceType;
  addressStructured?: AddressStructured;
  description?: string;
  createdAt: Date;
  email: string;
  creator: mongoose.Types.ObjectId | string;
  owner?: mongoose.Types.ObjectId | string;
  logo?: string;
  active?: boolean;
  settings?: {
    email?: EmailSettings<BusinessEmailTemplateKey>;
    security?: {
      require2fa?: boolean;
      enableSSO?: boolean;
      passwordlessLogin?: boolean;
      sessionTimeoutMinutes?: number;
      maxActiveSessions?: 1 | 3 | 5 | "unlimited";
      ipWhitelist?: {
        enabled?: boolean;
        ips?: string[];
      };
      passwordPolicy?: {
        minLength?: number;
        expiryDays?: number;
        requireUppercase?: boolean;
        requireNumbers?: boolean;
        requireSpecial?: boolean;
      };
    };
    general?: {
      timezone?: string;
      team?: {
        allowTeamInvitations?: boolean;
        defaultRoleForNewMembers?: string;
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

const PasswordPolicySchema = new Schema(
  {
    minLength: {
      type: Number,
      default: defaultBusinessSecuritySettings.passwordPolicy.minLength,
      min: 6,
      max: 64,
    },
    expiryDays: {
      type: Number,
      default: defaultBusinessSecuritySettings.passwordPolicy.expiryDays,
      min: 0,
      max: 365,
    },
    requireUppercase: {
      type: Boolean,
      default: defaultBusinessSecuritySettings.passwordPolicy.requireUppercase,
    },
    requireNumbers: {
      type: Boolean,
      default: defaultBusinessSecuritySettings.passwordPolicy.requireNumbers,
    },
    requireSpecial: {
      type: Boolean,
      default: defaultBusinessSecuritySettings.passwordPolicy.requireSpecial,
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
    enableSSO: {
      type: Boolean,
      default: defaultBusinessSecuritySettings.enableSSO,
    },
    passwordlessLogin: {
      type: Boolean,
      default: defaultBusinessSecuritySettings.passwordlessLogin,
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
    passwordPolicy: {
      type: PasswordPolicySchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

const GeneralSettingsSchema = new Schema(
  {
    timezone: { type: String, default: "America/New_York" },
    team: {
      allowTeamInvitations: { type: Boolean, default: true },
      defaultRoleForNewMembers: { type: String, default: "WORKSPACE_MEMBER" },
    },
  },
  { _id: false }
);

const businessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true, trim: true },
    registrationId: { type: String, trim: true },
    contact: { type: String, required: true, trim: true },
    countryCode: { type: String, required: true },
    workspaceType: {
      type: String,
      enum: WORKSPACE_TYPE_VALUES,
      default: WORKSPACE_TYPE.BUSINESS,
      required: true,
    },
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
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    logo: { type: String, default: "default.jpg" },
    active: { type: Boolean, default: true },
    settings: {
      email: { type: EmailSettingsSchema, default: () => ({}) },
      security: { type: SecuritySettingsSchema, default: () => ({}) },
      general: { type: GeneralSettingsSchema, default: () => ({}) },
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

/* --------------------------------- Export ---------------------------------- */

export const Business: Model<IBusiness> =
  mongoose.models.Business ||
  mongoose.model<IBusiness>("Business", businessSchema);
export default Business;
