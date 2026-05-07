import mongoose, {
  Schema,
  type Document,
  type Model,
  type Types,
} from "mongoose";

import { WORKSPACE_ROLE_VALUES, type WORKSPACE_ROLE } from "@/shared/auth/roles";
import { ROLES } from "@/shared/enums/enums";

export interface IAuthSession extends Document {
  sessionId: string;
  user: Types.ObjectId;
  businessId: string;
  role: ROLES;
  workspaceRole?: WORKSPACE_ROLE | null;
  ipAddress?: string;
  userAgent?: string;
  lastSeenAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const authSessionSchema = new Schema<IAuthSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    businessId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.tenant,
    },
    workspaceRole: {
      type: String,
      enum: WORKSPACE_ROLE_VALUES,
      default: null,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    lastSeenAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

authSessionSchema.index({
  user: 1,
  businessId: 1,
  revokedAt: 1,
  lastSeenAt: 1,
});

const AuthSession: Model<IAuthSession> =
  (mongoose.models.AuthSession as Model<IAuthSession>) ||
  mongoose.model<IAuthSession>("AuthSession", authSessionSchema);

export default AuthSession;
