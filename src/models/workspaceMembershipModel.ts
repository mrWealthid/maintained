import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

import {
  MEMBERSHIP_STATUS,
  MEMBERSHIP_STATUS_VALUES,
  type MembershipStatus,
} from "@/shared/auth/roles";
import { MEMBERSHIP_ROLES, type MembershipRole } from "@/models/userModel";
import {
  WORKSPACE_MEMBERSHIP_SOURCE,
  type WorkspaceMembershipSource,
} from "@/lib/tenancy/model";

export interface IWorkspaceMembership extends Document {
  workspace: Types.ObjectId;
  user: Types.ObjectId;
  role: MembershipRole;
  roleDefinition?: Types.ObjectId | null;
  status: MembershipStatus;
  joinedAt?: Date | null;
  createdBy?: Types.ObjectId | null;
  source: WorkspaceMembershipSource;
  specialties?: string[];
  property?: Types.ObjectId | null;
  unit?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceMembershipSchema = new Schema<IWorkspaceMembership>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: MEMBERSHIP_ROLES,
      required: true,
    },
    roleDefinition: {
      type: Schema.Types.ObjectId,
      ref: "RoleDefinition",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: MEMBERSHIP_STATUS_VALUES,
      required: true,
      default: MEMBERSHIP_STATUS.active,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    source: {
      type: String,
      enum: Object.values(WORKSPACE_MEMBERSHIP_SOURCE),
      required: true,
      default: WORKSPACE_MEMBERSHIP_SOURCE.seed,
      index: true,
    },
    specialties: {
      type: [String],
      default: undefined,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    unit: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },
  },
  { timestamps: true },
);

workspaceMembershipSchema.index({ workspace: 1, user: 1 }, { unique: true });
workspaceMembershipSchema.index({ user: 1, status: 1, updatedAt: -1 });
workspaceMembershipSchema.index({ workspace: 1, role: 1, status: 1 });
workspaceMembershipSchema.index({ workspace: 1, roleDefinition: 1, status: 1 });

const WorkspaceMembership: Model<IWorkspaceMembership> =
  (mongoose.models.WorkspaceMembership as Model<IWorkspaceMembership>) ||
  mongoose.model<IWorkspaceMembership>(
    "WorkspaceMembership",
    workspaceMembershipSchema,
  );

export default WorkspaceMembership;
