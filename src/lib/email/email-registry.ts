import type { AppEmailTemplateKey } from "@/shared/enums/email-template";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";

export type EmailAudience = "app";

export type AppEmailTemplateGroupId = "workspace" | "access" | "security";

type EmailTemplateGroupDefinition<GroupId extends string> = {
  id: GroupId;
  title: string;
  description: string;
};

type BaseEmailTemplateRegistryEntry<
  Key extends string,
  GroupId extends string,
  Audience extends EmailAudience,
> = {
  key: Key;
  audience: Audience;
  groupId: GroupId;
  name: string;
  description: string;
  settingsVisible: boolean;
};

export type AppEmailTemplateRegistryEntry = BaseEmailTemplateRegistryEntry<
  AppEmailTemplateKey,
  AppEmailTemplateGroupId,
  "app"
>;

export const APP_EMAIL_TEMPLATE_GROUPS = {
  workspace: {
    id: "workspace",
    title: "Workspace",
    description:
      "Workspace creation, upgrade, onboarding, and team membership emails.",
  },
  access: {
    id: "access",
    title: "Access",
    description:
      "Platform access notices for workspace activation and deactivation.",
  },
  security: {
    id: "security",
    title: "Security",
    description:
      "Authentication and account recovery emails such as resets, passcodes, and magic links.",
  },
} satisfies Record<
  AppEmailTemplateGroupId,
  EmailTemplateGroupDefinition<AppEmailTemplateGroupId>
>;

export const APP_EMAIL_TEMPLATE_REGISTRY: Record<
  AppEmailTemplateKey,
  AppEmailTemplateRegistryEntry
> = {
  [APP_EMAIL_TEMPLATE.BUSINESS_REGISTRATION]: {
    key: APP_EMAIL_TEMPLATE.BUSINESS_REGISTRATION,
    audience: "app",
    groupId: "workspace",
    name: "Initial Workspace Registration",
    description:
      "Sent when a new user signs up and their first workspace is created.",
    settingsVisible: true,
  },
  [APP_EMAIL_TEMPLATE.WORKSPACE_CREATED]: {
    key: APP_EMAIL_TEMPLATE.WORKSPACE_CREATED,
    audience: "app",
    groupId: "workspace",
    name: "Workspace Created",
    description: "Sent when an existing account creates an additional workspace.",
    settingsVisible: true,
  },
  [APP_EMAIL_TEMPLATE.WORKSPACE_UPGRADED]: {
    key: APP_EMAIL_TEMPLATE.WORKSPACE_UPGRADED,
    audience: "app",
    groupId: "workspace",
    name: "Workspace Upgraded",
    description: "Sent when a workspace is upgraded to a new plan or tier.",
    settingsVisible: true,
  },
  [APP_EMAIL_TEMPLATE.TEAM_INVITE]: {
    key: APP_EMAIL_TEMPLATE.TEAM_INVITE,
    audience: "app",
    groupId: "workspace",
    name: "Team Invite",
    description: "Sent when a user is invited into a workspace.",
    settingsVisible: true,
  },
  [APP_EMAIL_TEMPLATE.TEAM_WELCOME]: {
    key: APP_EMAIL_TEMPLATE.TEAM_WELCOME,
    audience: "app",
    groupId: "workspace",
    name: "Team Welcome",
    description:
      "Sent after a team invite is accepted and workspace access is activated.",
    settingsVisible: true,
  },
  [APP_EMAIL_TEMPLATE.BUSINESS_DEACTIVATED]: {
    key: APP_EMAIL_TEMPLATE.BUSINESS_DEACTIVATED,
    audience: "app",
    groupId: "access",
    name: "Workspace Deactivated",
    description: "Sent when a super admin deactivates a workspace.",
    settingsVisible: true,
  },
  [APP_EMAIL_TEMPLATE.BUSINESS_ACTIVATED]: {
    key: APP_EMAIL_TEMPLATE.BUSINESS_ACTIVATED,
    audience: "app",
    groupId: "access",
    name: "Workspace Activated",
    description:
      "Sent when a super admin reactivates a previously deactivated workspace.",
    settingsVisible: true,
  },
  [APP_EMAIL_TEMPLATE.FORGOT_PASSWORD]: {
    key: APP_EMAIL_TEMPLATE.FORGOT_PASSWORD,
    audience: "app",
    groupId: "security",
    name: "Forgot Password",
    description: "Sent when a user requests a password reset.",
    settingsVisible: true,
  },
  [APP_EMAIL_TEMPLATE.PASSWORD_CHANGE_PASSCODE]: {
    key: APP_EMAIL_TEMPLATE.PASSWORD_CHANGE_PASSCODE,
    audience: "app",
    groupId: "security",
    name: "Password Change Passcode",
    description: "Sent when password updates require passcode verification.",
    settingsVisible: true,
  },
  [APP_EMAIL_TEMPLATE.PASSWORD_UPDATED]: {
    key: APP_EMAIL_TEMPLATE.PASSWORD_UPDATED,
    audience: "app",
    groupId: "security",
    name: "Password Updated",
    description: "Sent after a password is changed successfully.",
    settingsVisible: true,
  },
  [APP_EMAIL_TEMPLATE.PASSWORDLESS_LOGIN]: {
    key: APP_EMAIL_TEMPLATE.PASSWORDLESS_LOGIN,
    audience: "app",
    groupId: "security",
    name: "Passwordless Login",
    description: "Sent when a user requests a magic sign-in link.",
    settingsVisible: true,
  },
};

export const APP_EMAIL_TEMPLATE_REGISTRY_ITEMS = Object.values(
  APP_EMAIL_TEMPLATE_REGISTRY,
) as AppEmailTemplateRegistryEntry[];

export function getAppEmailTemplateMeta(key: AppEmailTemplateKey) {
  return APP_EMAIL_TEMPLATE_REGISTRY[key];
}

export function getAppEmailSettingsGroups() {
  return Object.values(APP_EMAIL_TEMPLATE_GROUPS)
    .map((group) => ({
      ...group,
      templates: APP_EMAIL_TEMPLATE_REGISTRY_ITEMS.filter(
        (template) => template.settingsVisible && template.groupId === group.id,
      ),
    }))
    .filter((group) => group.templates.length > 0);
}
