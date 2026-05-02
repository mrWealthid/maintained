import {
  APP_EMAIL_TEMPLATE,
  APP_EMAIL_TEMPLATE_KEYS,
  type AppEmailTemplateKey,
} from "@/shared/enums/email-template";
import type { EmailTemplateConfig } from "@/lib/email/models/email.model";

export { APP_EMAIL_TEMPLATE_KEYS };
export type { AppEmailTemplateKey, EmailTemplateConfig as AppEmailTemplateConfig };

export const DEFAULT_APP_EMAIL_SETTINGS = {
  senderName: "Maintainly",
  senderEmail: "support@wealthtech.website",
  replyTo: "reply@wealthtech.website",
  bcc: "",
  footer:
    "Thank you for using {{app_name}}. For support, contact {{support_email}}.",
} as const;

export const DEFAULT_APP_EMAIL_TEMPLATES: Record<
  AppEmailTemplateKey,
  EmailTemplateConfig
> = {
  [APP_EMAIL_TEMPLATE.FORGOT_PASSWORD]: {
    enabled: true,
    subject: "Reset your {{app_name}} password",
    preheader: "Use your secure reset link to choose a new password.",
    body: `Hi {{attendee_name}},

We received a request to reset your {{app_name}} password.

Use the secure link below to set a new password:
{{reset_url}}

This link will expire in {{reset_token_expires_minutes}} minutes.

If you did not request this password reset, you can safely ignore this email.`,
    delay: "immediate",
    triggerDescription:
      "Sent when a user requests a password reset from the auth flow.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [APP_EMAIL_TEMPLATE.PASSWORD_CHANGE_PASSCODE]: {
    enabled: true,
    subject: "Your {{app_name}} verification code",
    preheader: "Use this code to finish updating your password.",
    body: `Hi {{attendee_name}},

Use this verification code to finish changing your {{app_name}} password:

{{passcode}}

This code expires in {{passcode_expires_minutes}} minutes.

If you did not request this password change, secure your account and contact support.`,
    delay: "immediate",
    triggerDescription:
      "Sent when a signed-in user starts the password change flow.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
};
