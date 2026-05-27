import { z } from "zod";

import type { AppEmailTemplateKey } from "@/shared/enums/email-template";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";

const stringVar = (value: string) => z.string().default(value);

export const appEmailPreviewVariablesSchema = z.object({
  attendee_name: stringVar("Jane Smith"),
  attendee_first_name: stringVar("Jane"),
  attendee_email: stringVar("jane@example.com"),
  app_name: stringVar("Properly"),
  support_email: stringVar("support@maintainly.app"),
  business_name: stringVar("Acme Properties"),
  workspace_label: stringVar("Property Management Workspace"),
  previous_workspace_label: stringVar("Solo Workspace"),
  workspace_role: stringVar("Owner"),
  plan_name: stringVar("Pro"),
  inviter_name: stringVar("Casey Chen"),

  dashboard_url: stringVar("https://app.maintainly.app/dashboard"),
  login_url: stringVar("https://app.maintainly.app/auth/login"),
  invite_url: stringVar("https://app.maintainly.app/invite/accept/abc123"),
  invite_expires_hours: stringVar("48"),

  reset_url: stringVar(
    "https://app.maintainly.app/auth/reset-password?token=abc123",
  ),
  reset_token_expires_minutes: stringVar("30"),
  passcode: stringVar("483920"),
  passcode_expires_minutes: stringVar("10"),
  magic_link_url: stringVar(
    "https://app.maintainly.app/auth/login?token=magic123",
  ),
  magic_link_revoke_url: stringVar(
    "https://app.maintainly.app/auth/passwordless/revoke?token=magic123",
  ),
  magic_link_expires_minutes: stringVar("10"),
});

export type AppEmailPreviewVariables = z.infer<
  typeof appEmailPreviewVariablesSchema
>;

export const DEFAULT_APP_EMAIL_PREVIEW_VARIABLES =
  appEmailPreviewVariablesSchema.parse({});

const APP_EMAIL_TEMPLATE_PREVIEW_OVERRIDES: Partial<
  Record<AppEmailTemplateKey, Partial<AppEmailPreviewVariables>>
> = {
  [APP_EMAIL_TEMPLATE.BUSINESS_REGISTRATION]: {
    business_name: "Acme Properties",
    workspace_label: "Business Workspace",
    workspace_role: "Owner",
  },
  [APP_EMAIL_TEMPLATE.WORKSPACE_CREATED]: {
    business_name: "Westside Management",
    workspace_label: "Property Workspace",
    workspace_role: "Owner",
  },
  [APP_EMAIL_TEMPLATE.WORKSPACE_UPGRADED]: {
    business_name: "Westside Management",
    previous_workspace_label: "Solo Workspace",
    workspace_label: "Business Workspace",
    plan_name: "Pro",
  },
  [APP_EMAIL_TEMPLATE.BUSINESS_DEACTIVATED]: {
    business_name: "Northgate Holdings",
    workspace_label: "Business Workspace",
  },
  [APP_EMAIL_TEMPLATE.BUSINESS_ACTIVATED]: {
    business_name: "Northgate Holdings",
    workspace_label: "Business Workspace",
  },
  [APP_EMAIL_TEMPLATE.TEAM_INVITE]: {
    business_name: "Acme Properties",
    workspace_label: "Business Workspace",
    invite_expires_hours: "48",
    inviter_name: "Casey Chen",
  },
  [APP_EMAIL_TEMPLATE.TEAM_WELCOME]: {
    business_name: "Acme Properties",
    workspace_label: "Business Workspace",
    workspace_role: "Admin",
  },
  [APP_EMAIL_TEMPLATE.FORGOT_PASSWORD]: {
    reset_token_expires_minutes: "30",
  },
  [APP_EMAIL_TEMPLATE.PASSWORD_CHANGE_PASSCODE]: {
    passcode_expires_minutes: "10",
  },
  [APP_EMAIL_TEMPLATE.PASSWORD_UPDATED]: {},
  [APP_EMAIL_TEMPLATE.PASSWORDLESS_LOGIN]: {
    magic_link_expires_minutes: "10",
  },
};

export function getAppEmailTemplatePreviewConfig(
  key: AppEmailTemplateKey,
  overrides?: Partial<AppEmailPreviewVariables>,
) {
  const variables = appEmailPreviewVariablesSchema.parse({
    ...DEFAULT_APP_EMAIL_PREVIEW_VARIABLES,
    ...(APP_EMAIL_TEMPLATE_PREVIEW_OVERRIDES[key] ?? {}),
    ...(overrides ?? {}),
  });

  return {
    schema: appEmailPreviewVariablesSchema,
    variables,
  };
}
