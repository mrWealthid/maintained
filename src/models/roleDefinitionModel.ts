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
import {
  WORKSPACE_ROLE_VALUES,
  type AssignableWorkspaceRole,
} from "@/shared/auth/roles";

export const ROLE_DEFINITION_STATUS = {
  active: "ACTIVE",
  archived: "ARCHIVED",
} as const;

export type RoleDefinitionStatus =
  (typeof ROLE_DEFINITION_STATUS)[keyof typeof ROLE_DEFINITION_STATUS];

export const ROLE_DEFINITION_STATUS_VALUES = Object.values(
  ROLE_DEFINITION_STATUS
);

export interface IRoleDefinition extends Document {
  scope: PermissionScope;
  workspace?: Types.ObjectId | null;
  key: string;
  name: string;
  description?: string | null;
  permissions: PermissionKey[];
  legacyRole?: AssignableWorkspaceRole | null;
  isSystem: boolean;
  isDefault: boolean;
  locked: boolean;
  status: RoleDefinitionStatus;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const roleDefinitionSchema = new Schema<IRoleDefinition>(
  {
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
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    permissions: {
      type: [String],
      enum: ALL_PERMISSION_KEYS,
      default: [],
      required: true,
    },
    legacyRole: {
      type: String,
      enum: WORKSPACE_ROLE_VALUES,
      default: null,
      index: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
      required: true,
    },
    locked: {
      type: Boolean,
      default: false,
      required: true,
    },
    status: {
      type: String,
      enum: ROLE_DEFINITION_STATUS_VALUES,
      default: ROLE_DEFINITION_STATUS.active,
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

roleDefinitionSchema.index(
  { scope: 1, workspace: 1, key: 1 },
  { unique: true }
);
roleDefinitionSchema.index({ workspace: 1, scope: 1, status: 1, name: 1 });
roleDefinitionSchema.index({
  workspace: 1,
  scope: 1,
  legacyRole: 1,
  status: 1,
});
roleDefinitionSchema.index(
  { workspace: 1, scope: 1, isDefault: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDefault: true,
      status: ROLE_DEFINITION_STATUS.active,
    },
  }
);

const RoleDefinition: Model<IRoleDefinition> =
  (mongoose.models.RoleDefinition as Model<IRoleDefinition>) ||
  mongoose.model<IRoleDefinition>("RoleDefinition", roleDefinitionSchema);

export default RoleDefinition;
