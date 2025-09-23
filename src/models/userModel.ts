import mongoose, {
  Document,
  Schema,
  Model,
  Types,
  InferSchemaType,
} from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Business from "./businessModel";
import { INVITE_STATUS, ROLES } from "@/app/shared/enums/enums";

export interface IUser extends Document {
  name: string;
  email: string;
  photo?: string;
  // role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'TECHNICIAN' | 'OWNER';
  password: string;
  // business: mongoose.Types.ObjectId;
  createdAt: Date;
  dateOfBirth?: Date;

  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active?: boolean;
  // status?: 'INVITED' | 'ACTIVATED' | 'DEACTIVATED';
  changedPasswordAfter(JWTTimestamp: number): Promise<boolean>;
  correctPassword(newPassword: string, userPassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  // createUserInviteToken(): string;
  passwordConfirm: string;
  memberships: {
    business: Types.ObjectId;
    role: ROLES;
    status: INVITE_STATUS;
    inviteToken?: string;
    inviteTokenExpires?: Date;
    specialties?: TechnicianSpecialty[];
    property?: Types.ObjectId;
    unit?: Types.ObjectId;
    accessibleUnits?: Types.ObjectId[];
    isCreator: boolean;
  }[];
  currentBusiness: Types.ObjectId;
  tenantsClaim(): Array<{
    business: string;
    role: ROLES;
    status: INVITE_STATUS;
  }>;
}

export const MEMBERSHIP_ROLES = [
  "USER",
  "ADMIN",
  "TECHNICIAN",
  "OWNER",
  "SUPER_ADMIN",
] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const STATUS = ["INVITED", "ACTIVATED", "DEACTIVATED"] as const;
export type UserStatus = (typeof STATUS)[number];

// Customize/expand as needed
export const TECH_SPECIALTIES = [
  "ELECTRICIAN",
  "PLUMBER",
  "HVAC",
  "CARPENTER",
  "PAINTER",
  "LOCKSMITH",
  "APPLIANCE_REPAIR",
  "GENERAL_HANDYMAN",
] as const;
export type TechnicianSpecialty = (typeof TECH_SPECIALTIES)[number];
//subschema
// const MembershipSchema = new Schema(
//   {
//     business: {
//       type: Schema.Types.ObjectId,
//       ref: Business, // or keep your `ref: Business` if you prefer
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: STATUS,
//     },
//     role: {
//       type: String,
//       enum: MEMBERSHIP_ROLES,
//       required: true,
//     },

//     // 👇 Multiple specialties (technicians only)
//     specialties: {
//       type: [String], // array of strings
//       enum: TECH_SPECIALTIES, // each item must be one of TECH_SPECIALTIES
//       default: undefined, // omit when not set
//       validate: {
//         validator(this: any, val?: string[]) {
//           if (this.role === MEMBERSHIP_ROLES[2]) {
//             return (
//               Array.isArray(val) &&
//               val.length > 0 &&
//               val.every((s) =>
//                 TECH_SPECIALTIES.includes(String(s).toUpperCase().trim() as any)
//               )
//             );
//           }
//           // non-technicians: must be empty or undefined
//           return val === undefined || (Array.isArray(val) && val.length === 0);
//         },
//         message: "Technicians must have at least one valid specialty.",
//       },
//       // normalize values to UPPERCASE, trim, and unique
//       set: (val: unknown) => {
//         if (!Array.isArray(val)) return undefined;
//         const cleaned = val
//           .map((v) => String(v).toUpperCase().trim())
//           .filter(Boolean);
//         return Array.from(new Set(cleaned));
//       },
//     },
//     inviteToken: { type: String },
//     inviteTokenExpires: { type: Date },
//   },
//   {
//     _id: false,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );
const LocationSnapshot = new Schema(
  {
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
  { _id: false }
);

const MembershipSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: Business,
      required: true,
    },
    status: {
      type: String,
      enum: STATUS,
      default: "INVITED",
    },
    role: {
      type: String,
      enum: MEMBERSHIP_ROLES,
      required: true,
    },
    isCreator: {
      type: Boolean,
      default: false,
    },

    // 🔴 NEW — required for tenants (role === USER)
    property: { type: Schema.Types.ObjectId, ref: "Property" },
    unit: { type: Schema.Types.ObjectId, ref: "Unit" },

    // 🔵 NEW — optional: allow multi-unit tenants (admin-assigned)
    accessibleUnits: [{ type: Schema.Types.ObjectId, ref: "Unit" }],

    // keep your technician specialties exactly as you had
    specialties: {
      type: [String],
      enum: TECH_SPECIALTIES,
      default: undefined,
      validate: {
        validator(this: any, val?: string[]) {
          if (this.role === "TECHNICIAN") {
            return (
              Array.isArray(val) &&
              val.length > 0 &&
              val.every((s) =>
                TECH_SPECIALTIES.includes(String(s).toUpperCase().trim() as any)
              )
            );
          }
          return val === undefined || (Array.isArray(val) && val.length === 0);
        },
        message: "Technicians must have at least one valid specialty.",
      },
      set: (val: unknown) => {
        if (!Array.isArray(val)) return undefined;
        const cleaned = val
          .map((v) => String(v).toUpperCase().trim())
          .filter(Boolean);
        return Array.from(new Set(cleaned));
      },
    },

    // Invite tokens (scoped to this business membership)
    inviteToken: { type: String },
    inviteTokenExpires: { type: Date },

    // 🟣 NEW — snapshot to keep old tickets readable after renames/moves
    locationSnapshot: { type: LocationSnapshot },
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Virtuals available to the frontend ---

// 1) Boolean flag: has this invite expired?
MembershipSchema.virtual("inviteExpired").get(function (this: any) {
  const exp = this.inviteTokenExpires
    ? new Date(this.inviteTokenExpires)
    : null;
  return !exp || Date.now() > exp.getTime();
});

// Strip specialties for non-techs; re-apply normalization just in case
MembershipSchema.pre("validate", function (next) {
  if (this.role !== "TECHNICIAN") {
    this.specialties = undefined;
  } else if (Array.isArray(this.specialties)) {
    this.specialties = Array.from(
      new Set(
        this.specialties
          .map((s: string) => String(s).toUpperCase().trim())
          .filter(Boolean)
      )
    );
  }
  // 🔒 Enforce property/unit for tenants
  if (this.role === ROLES.user && (!this.property || !this.unit)) {
    return next(new Error("Tenant membership requires property and unit"));
  }
  next();
});

// 2) Seconds left until expiry (negative if already expired, -1 if no expiry set)
// MembershipSchema.virtual("inviteTTLSeconds").get(function (this: any) {
//   const exp = this.inviteTokenExpires
//     ? new Date(this.inviteTokenExpires)
//     : null;
//   if (!exp) return -1;
//   return Math.floor((exp.getTime() - Date.now()) / 1000);
// });

// 3) Friendly UI status
// MembershipSchema.virtual("inviteStatus").get(function (this: any) {
//   if (this.status === "ACTIVATED") return "activated";
//   return this.inviteExpired ? "expired" : "pending";
// });

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, "Please tell us your name!"] },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: { type: String, default: "default.jpg" },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    memberships: {
      type: [MembershipSchema],
      default: [],
    },

    currentBusiness: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Business,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    dateOfBirth: { type: Date },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret: Record<string, any>) {
    ret.id = ret._id?.toString();
    delete ret._id;
  },
});

userSchema.methods.tenantsClaim = function (): Array<{
  businessId: string;
  role: ROLES;
}> {
  return (this.memberships || [])
    .filter((m: any) => m.status === "ACTIVATED")
    .map((m: any) => ({
      business: String(m.business),
      role: m.role as ROLES,
      status: m.status as INVITE_STATUS,
    }));
};

export type UserDoc = mongoose.Document &
  Omit<InferSchemaType<typeof userSchema>, "memberships"> & {
    memberships: Array<{
      business: Types.ObjectId;
      role: ROLES;
      status: INVITE_STATUS;
      specialties?: TechnicianSpecialty[];
      inviteToken?: string;
      inviteTokenExpires?: Date;
      inviteExpired?: boolean;
      property?: Types.ObjectId;
      unit?: Types.ObjectId;
      accessibleUnits?: Types.ObjectId[];
      locationSnapshot?: {
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
      };
    }>;
    tenantsClaim(): Array<{
      business: string;
      role: ROLES;
      status: INVITE_STATUS;
      specialties?: TechnicianSpecialty[];
      // specialty?: TechnicianSpecialty;
    }>;
  };
// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Set passwordChangedAt
userSchema.pre<IUser>("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Exclude inactive users from queries
userSchema.pre(/^find/, function (next) {
  (this as mongoose.Query<any, any>).where({ active: { $ne: false } });
  next();
});

// Instance methods
userSchema.methods.changedPasswordAfter = async function (
  JWTTimestamp: number
): Promise<boolean> {
  if (this.passwordChangedAt) {
    const changedTimeStamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.correctPassword = async function (
  newPassword: string,
  userPassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(newPassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  return resetToken;
};

userSchema.methods.createUserInviteToken = function (): string {
  const inviteToken = crypto.randomBytes(32).toString("hex");
  this.inviteToken = crypto
    .createHash("sha256")
    .update(inviteToken)
    .digest("hex");
  this.inviteTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs
  return inviteToken;
};

userSchema.index({
  "memberships.business": 1,
  "memberships.role": 1,
  "memberships.specialties": 1,
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
