import { z } from "zod";
import { APP_EMAIL_TEMPLATE_KEYS } from "@/shared/enums/email-template";

export type { AppEmailTemplateKey } from "@/shared/enums/email-template";

const passwordPolicySchema = z.object({
  minLength: z.number().int().min(6).max(64),
  expiryDays: z.number().int().min(0).max(365),
  requireUppercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecial: z.boolean(),
});

export const appSecuritySchema = z.object({
  require2fa: z.boolean(),
  enableSSO: z.boolean(),
  passwordlessLogin: z.boolean(),
  passwordPolicy: passwordPolicySchema,
});

const integrationStateSchema = z.object({
  connected: z.boolean(),
});

export const appGeneralSchema = z.object({
  timezone: z.string(),
  dateFormat: z.enum(["mdy", "dmy", "ymd"]),
  timeFormat: z.enum(["12h", "24h"]),
  language: z.enum(["en", "es", "fr", "de", "pt"]),
  integrations: z.object({
    googleCalendar: integrationStateSchema,
    slack: integrationStateSchema,
    mailchimp: integrationStateSchema,
    zapier: integrationStateSchema,
  }),
});

export const appNotificationsSchema = z.object({
  businessRegistrationAlerts: z.boolean(),
  teamInviteAlerts: z.boolean(),
  passwordResetAlerts: z.boolean(),
  passwordChangeAlerts: z.boolean(),
  appEmailDeliveryAlerts: z.boolean(),
  emailFrequency: z.enum(["immediate", "hourly", "daily", "weekly", "off"]),
  pushPreference: z.enum(["all", "important", "off"]),
});

const emailTemplateDelaySchema = z.enum([
  "immediate",
  "1h",
  "24h",
  "48h",
  "custom",
]);

const appEmailTemplateSchema = z.object({
  enabled: z.boolean(),
  subject: z.string(),
  preheader: z.string(),
  body: z.string(),
  delay: emailTemplateDelaySchema,
  triggerDescription: z.string(),
  includeUnsubscribe: z.boolean(),
  replyToOverride: z.string(),
  customDelayMinutes: z.number().int().min(1).max(10080).optional(),
});

const emailOrEmpty = z.union([z.string().email(), z.literal("")]);

export const appEmailSchema = z.object({
  senderName: z.string().min(1, "Sender name is required"),
  senderEmail: z.string().email("Enter a valid sender email"),
  replyTo: emailOrEmpty,
  bcc: emailOrEmpty,
  footer: z.string(),
  templates: z.object(
    Object.fromEntries(
      APP_EMAIL_TEMPLATE_KEYS.map((key) => [key, appEmailTemplateSchema]),
    ) as Record<(typeof APP_EMAIL_TEMPLATE_KEYS)[number], typeof appEmailTemplateSchema>,
  ),
});

export const appSettingsSchema = z.object({
  settings: z.object({
    general: appGeneralSchema,
    notifications: appNotificationsSchema,
    email: appEmailSchema,
    security: appSecuritySchema,
  }),
});

export type AppSettingsFormValues = z.infer<typeof appSettingsSchema>;
export type AppSecurityFormValues = z.infer<typeof appSecuritySchema>;
export type AppGeneralFormValues = z.infer<typeof appGeneralSchema>;
export type AppNotificationsFormValues = z.infer<typeof appNotificationsSchema>;
export type AppEmailFormValues = z.infer<typeof appEmailSchema>;
export type AppEmailTemplateFormValues = z.infer<typeof appEmailTemplateSchema>;
