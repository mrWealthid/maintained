import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

import {
  ALL_PERMISSION_KEYS,
  PERMISSION_SCOPE,
  type PermissionKey,
  type PermissionScope,
} from "@/shared/auth/permission-registry";

export const PERMISSION_OVERRIDE_EFFECT = {
  allow: "ALLOW",
  deny: "DENY",
} as const;

export type PermissionOverrideEffect =
  (typeof PERMISSION_OVERRIDE_EFFECT)[keyof typeof PERMISSION_OVERRIDE_EFFECT];

export const PERMISSION_OVERRIDE_EFFECT_VALUES = Object.values(
  PERMISSION_OVERRIDE_EFFECT
);

export interface IUserPermissionOverride extends Document {
  user: Types.ObjectId;
  scope: PermissionScope;
  workspace?: Types.ObjectId | null;
  permission: PermissionKey;
  effect: PermissionOverrideEffect;
  reason?: string | null;
  createdBy?: Types.ObjectId | null;
  revokedBy?: Types.ObjectId | null;
  revokedAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userPermissionOverrideSchema = new Schema<IUserPermissionOverride>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    scope: {
      type: String,
      enum: Object.values(PERMISSION_SCOPE),
      required: true,
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      default: null,
      index: true,
    },
    permission: {
      type: String,
      enum: ALL_PERMISSION_KEYS,
      required: true,
      index: true,
    },
    effect: {
      type: String,
      enum: PERMISSION_OVERRIDE_EFFECT_VALUES,
      required: true,
      default: PERMISSION_OVERRIDE_EFFECT.allow,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

userPermissionOverrideSchema.index({
  user: 1,
  workspace: 1,
  scope: 1,
  permission: 1,
  revokedAt: 1,
});
userPermissionOverrideSchema.index({ workspace: 1, scope: 1, permission: 1 });

const UserPermissionOverride: Model<IUserPermissionOverride> =
  (mongoose.models.UserPermissionOverride as Model<IUserPermissionOverride>) ||
  mongoose.model<IUserPermissionOverride>(
    "UserPermissionOverride",
    userPermissionOverrideSchema
  );

export default UserPermissionOverride;
