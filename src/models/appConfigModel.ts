import mongoose, { Document, Schema } from "mongoose";
import { DEFAULT_PASSWORD_POLICY } from "@/lib/security/password-policy.shared";

export const defaultAppSettings = {
  security: {
    require2fa: false,
    enableSSO: false,
    passwordlessLogin: false,
    passwordPolicy: { ...DEFAULT_PASSWORD_POLICY },
  },
};

export type AppSecuritySettingsShape = typeof defaultAppSettings.security;

export interface IAppConfig extends Document {
  key: string;
  settings?: {
    security?: Partial<AppSecuritySettingsShape>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AppConfigSchema = new Schema<IAppConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
      trim: true,
    },
    settings: {
      type: Schema.Types.Mixed,
      default: () => ({
        security: { ...defaultAppSettings.security },
      }),
    },
  },
  { timestamps: true },
);

const AppConfig =
  (mongoose.models.AppConfig as mongoose.Model<IAppConfig>) ||
  mongoose.model<IAppConfig>("AppConfig", AppConfigSchema);

export default AppConfig;
