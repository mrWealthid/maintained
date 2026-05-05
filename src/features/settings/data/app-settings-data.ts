import { DEFAULT_PASSWORD_POLICY } from "@/lib/security/password-policy.shared";
import { DEFAULT_TIME_ZONE } from "@/lib/date/timezone-options";
import {
  DEFAULT_APP_EMAIL_SETTINGS,
  DEFAULT_APP_EMAIL_TEMPLATES,
} from "@/lib/email/defaults/default-app-email-template";
import type { AppSettingsFormValues } from "../models/app-settings-form.model";

export const defaultAppSettings: AppSettingsFormValues["settings"] = {
  general: {
    timezone: DEFAULT_TIME_ZONE,
    dateFormat: "mdy",
    timeFormat: "12h",
    language: "en",
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
    emailFrequency: "immediate",
    pushPreference: "important",
  },
  email: {
    senderName: DEFAULT_APP_EMAIL_SETTINGS.senderName,
    senderEmail: DEFAULT_APP_EMAIL_SETTINGS.senderEmail,
    replyTo: DEFAULT_APP_EMAIL_SETTINGS.replyTo,
    bcc: DEFAULT_APP_EMAIL_SETTINGS.bcc,
    footer: DEFAULT_APP_EMAIL_SETTINGS.footer,
    templates: Object.fromEntries(
      Object.entries(DEFAULT_APP_EMAIL_TEMPLATES).map(([key, t]) => [
        key,
        {
          enabled: t.enabled ?? true,
          subject: t.subject,
          preheader: t.preheader,
          body: t.body,
          delay: t.delay,
          triggerDescription: t.triggerDescription,
          includeUnsubscribe: t.includeUnsubscribe ?? false,
          replyToOverride: t.replyToOverride ?? "",
          ...(t.customDelayMinutes !== undefined
            ? { customDelayMinutes: t.customDelayMinutes }
            : {}),
        },
      ]),
    ) as AppSettingsFormValues["settings"]["email"]["templates"],
  },
  security: {
    require2fa: false,
    enableSSO: false,
    passwordlessLogin: false,
    passwordPolicy: { ...DEFAULT_PASSWORD_POLICY },
  },
};
