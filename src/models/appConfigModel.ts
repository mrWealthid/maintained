import mongoose, { Document, Schema } from "mongoose";
import { DEFAULT_PASSWORD_POLICY } from "@/lib/security/password-policy.shared";
import { DEFAULT_TIME_ZONE } from "@/lib/date/timezone-options";
import {
  DEFAULT_APP_EMAIL_SETTINGS,
  DEFAULT_APP_EMAIL_TEMPLATES,
} from "@/lib/email/defaults/default-app-email-template";

export const defaultAppSettings = {
  general: {
    timezone: DEFAULT_TIME_ZONE,
    dateFormat: "mdy" as "mdy" | "dmy" | "ymd",
    timeFormat: "12h" as "12h" | "24h",
    language: "en" as "en" | "es" | "fr" | "de" | "pt",
    integrations: {
      googleCalendar: { connected: false },
      slack: { connected: false },
      mailchimp: { connected: false },
      zapier: { connected: false },
    },
  },
  notifications: {
    businessRegistrationAlerts: true,
    teamInviteAlerts: true,
    passwordResetAlerts: true,
    passwordChangeAlerts: true,
    appEmailDeliveryAlerts: true,
    emailFrequency: "immediate" as
      | "immediate"
      | "hourly"
      | "daily"
      | "weekly"
      | "off",
    pushPreference: "important" as "all" | "important" | "off",
  },
  email: {
    senderName: DEFAULT_APP_EMAIL_SETTINGS.senderName as string,
    senderEmail: DEFAULT_APP_EMAIL_SETTINGS.senderEmail as string,
    replyTo: DEFAULT_APP_EMAIL_SETTINGS.replyTo as string,
    bcc: DEFAULT_APP_EMAIL_SETTINGS.bcc as string,
    footer: DEFAULT_APP_EMAIL_SETTINGS.footer as string,
    templates: DEFAULT_APP_EMAIL_TEMPLATES as Record<string, unknown>,
  },
  security: {
    require2fa: false,
    enableSSO: false,
    passwordlessLogin: false,
    passwordPolicy: { ...DEFAULT_PASSWORD_POLICY },
  },
};

export type AppSecuritySettingsShape = typeof defaultAppSettings.security;
export type AppGeneralSettingsShape = typeof defaultAppSettings.general;
export type AppNotificationsSettingsShape = typeof defaultAppSettings.notifications;
export type AppEmailSettingsShape = typeof defaultAppSettings.email;

export interface IAppConfig extends Document {
  key: string;
  settings?: {
    general?: Partial<AppGeneralSettingsShape>;
    notifications?: Partial<AppNotificationsSettingsShape>;
    email?: Partial<AppEmailSettingsShape>;
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
        general: { ...defaultAppSettings.general },
        notifications: { ...defaultAppSettings.notifications },
        email: { ...defaultAppSettings.email },
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
