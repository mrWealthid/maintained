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
  [APP_EMAIL_TEMPLATE.PASSWORDLESS_LOGIN]: {
    enabled: true,
    subject: "Your secure sign-in link for {{app_name}}",
    preheader: "Sign in without a password — link expires in 10 minutes.",
    body: `Hi {{attendee_name}},

You requested a passwordless sign-in link for {{app_name}}.

Sign in without a password using this secure link:
{{magic_link_url}}

This link will expire in {{magic_link_expires_minutes}} minutes and can only be used once.

If you did not request this link, you can revoke it here:
{{magic_link_revoke_url}}`,
    delay: "immediate",
    triggerDescription:
      "Sent when a user requests a passwordless sign-in link from the login screen.",
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
  [APP_EMAIL_TEMPLATE.BUSINESS_REGISTRATION]: {
    enabled: true,
    subject: "Welcome to {{app_name}}, {{business_name}}",
    preheader: "Your workspace is ready — finish setting things up.",
    body: `Hi {{attendee_name}},

Thanks for registering {{business_name}} on {{app_name}}.

Your workspace is ready. Sign in to add properties, invite your team, and start managing maintenance requests:
{{dashboard_url}}

If you have questions, reply to this email and we will help.`,
    delay: "immediate",
    triggerDescription:
      "Sent to the workspace owner immediately after a new business signs up.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [APP_EMAIL_TEMPLATE.WORKSPACE_CREATED]: {
    enabled: true,
    subject: "{{business_name}} workspace created",
    preheader: "Your new workspace on {{app_name}} is live.",
    body: `Hi {{attendee_name}},

The workspace "{{business_name}}" is now live on {{app_name}}.

Open the workspace dashboard:
{{dashboard_url}}

You can manage members, properties, and tickets from there.`,
    delay: "immediate",
    triggerDescription:
      "Sent when a user creates an additional workspace under their account.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [APP_EMAIL_TEMPLATE.WORKSPACE_UPGRADED]: {
    enabled: true,
    subject: "{{business_name}} has been upgraded",
    preheader: "New plan features are now active on your workspace.",
    body: `Hi {{attendee_name}},

The {{business_name}} workspace has been upgraded to {{plan_name}}.

The new features are active immediately. Review what is now available:
{{dashboard_url}}

If anything looks off, reply to this email and we will sort it out.`,
    delay: "immediate",
    triggerDescription:
      "Sent when a workspace's plan or tier is upgraded.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [APP_EMAIL_TEMPLATE.BUSINESS_DEACTIVATED]: {
    enabled: true,
    subject: "{{business_name}} has been deactivated",
    preheader: "Access to your workspace is paused.",
    body: `Hi {{attendee_name}},

The {{business_name}} workspace on {{app_name}} has been deactivated. Members of this workspace no longer have access until it is re-activated.

If this was unexpected, reply to this email and we will look into it.`,
    delay: "immediate",
    triggerDescription:
      "Sent when an admin deactivates a workspace.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [APP_EMAIL_TEMPLATE.BUSINESS_ACTIVATED]: {
    enabled: true,
    subject: "{{business_name}} is active again",
    preheader: "Your workspace is back online.",
    body: `Hi {{attendee_name}},

The {{business_name}} workspace on {{app_name}} has been re-activated. Members can now sign in and resume work:
{{dashboard_url}}`,
    delay: "immediate",
    triggerDescription:
      "Sent when a previously deactivated workspace is restored.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [APP_EMAIL_TEMPLATE.TEAM_INVITE]: {
    enabled: true,
    subject: "You have been invited to {{business_name}}",
    preheader: "Accept your invite to join {{business_name}} on {{app_name}}.",
    body: `Hi {{attendee_name}},

{{inviter_name}} has invited you to join {{business_name}} on {{app_name}}.

Accept the invite and finish onboarding here:
{{invite_url}}

This link will expire in {{invite_expires_hours}} hours.`,
    delay: "immediate",
    triggerDescription:
      "Sent at the platform level when a workspace admin invites a new team member.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [APP_EMAIL_TEMPLATE.TEAM_WELCOME]: {
    enabled: true,
    subject: "Welcome to {{business_name}}",
    preheader: "Your account is set up — here's how to get started.",
    body: `Hi {{attendee_name}},

Welcome to {{business_name}} on {{app_name}}. Your account is ready.

Sign in here to start working on tickets and managing properties:
{{dashboard_url}}

If you need a hand finding your way around, reply to this email.`,
    delay: "immediate",
    triggerDescription:
      "Sent the first time a newly-invited team member completes onboarding.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [APP_EMAIL_TEMPLATE.PASSWORD_UPDATED]: {
    enabled: true,
    subject: "Your {{app_name}} password was changed",
    preheader: "Confirming a successful password update.",
    body: `Hi {{attendee_name}},

Your {{app_name}} password was just changed.

If you made this change, no action is needed.

If you did not change your password, secure your account immediately by resetting it here:
{{reset_url}}

Then contact support so we can investigate.`,
    delay: "immediate",
    triggerDescription:
      "Sent after a user successfully changes their password.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
};
