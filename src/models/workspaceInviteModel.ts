import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

import {
  WORKSPACE_ASSIGNABLE_ROLE_VALUES,
  USER_TYPE_VALUES,
  type AssignableWorkspaceRole,
  type USER_TYPE,
} from "@/shared/auth/roles";
import {
  WORKSPACE_INVITE_STATUS,
  WORKSPACE_INVITE_STATUS_VALUES,
  type WorkspaceInviteStatus,
} from "@/lib/tenancy/model";

export type WorkspaceInviteRole = AssignableWorkspaceRole | USER_TYPE;

export const WORKSPACE_INVITE_ROLE_VALUES = [
  ...WORKSPACE_ASSIGNABLE_ROLE_VALUES,
  ...USER_TYPE_VALUES,
] as const;

export interface IWorkspaceInvite extends Document {
  workspace: Types.ObjectId;
  email: string;
  name: string;
  role: WorkspaceInviteRole;
  specialties?: string[];
  property?: Types.ObjectId | null;
  unit?: Types.ObjectId | null;
  invitedUser?: Types.ObjectId | null;
  invitedBy: Types.ObjectId;
  status: WorkspaceInviteStatus;
  tokenHash?: string | null;
  tokenExpiresAt?: Date | null;
  invitedAt?: Date | null;
  lastSentAt?: Date | null;
  acceptedAt?: Date | null;
  declinedAt?: Date | null;
  revokedAt?: Date | null;
  acceptedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceInviteSchema = new Schema<IWorkspaceInvite>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: WORKSPACE_INVITE_ROLE_VALUES,
      required: true,
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
    invitedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: WORKSPACE_INVITE_STATUS_VALUES,
      required: true,
      default: WORKSPACE_INVITE_STATUS.pending,
      index: true,
    },
    tokenHash: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    tokenExpiresAt: {
      type: Date,
      default: null,
    },
    invitedAt: {
      type: Date,
      default: null,
    },
    lastSentAt: {
      type: Date,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    declinedAt: {
      type: Date,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

workspaceInviteSchema.index(
  { workspace: 1, email: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: WORKSPACE_INVITE_STATUS.pending,
    },
  },
);
workspaceInviteSchema.index({ invitedUser: 1, status: 1, updatedAt: -1 });
workspaceInviteSchema.index({ workspace: 1, status: 1, updatedAt: -1 });

const WorkspaceInvite: Model<IWorkspaceInvite> =
  (mongoose.models.WorkspaceInvite as Model<IWorkspaceInvite>) ||
  mongoose.model<IWorkspaceInvite>("WorkspaceInvite", workspaceInviteSchema);

export default WorkspaceInvite;
