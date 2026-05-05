import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardList,
  KeyRound,
  MailPlus,
  MessageSquareText,
  Send,
  Shield,
  Ticket,
  Users,
  Wrench,
} from "lucide-react";

import { emailTemplateGroups } from "./settings.data";
import type { BusinessEmailTemplateKey } from "../models/settings.model";
import {
  getAppEmailSettingsGroups,
  type AppEmailTemplateGroupId,
  type AppEmailTemplateRegistryEntry,
} from "@/lib/email/email-registry";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";

export type BusinessEmailSettingsTemplateMeta = {
  key: BusinessEmailTemplateKey;
  name: string;
  description: string;
  icon: LucideIcon;
};

export type BusinessEmailSettingsGroupMeta = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  templates: BusinessEmailSettingsTemplateMeta[];
};

const GROUP_ICONS: Record<string, LucideIcon> = {
  team: Users,
  tickets: Ticket,
};

const TEMPLATE_ICONS: Record<BusinessEmailTemplateKey, LucideIcon> = {
  team_invite: MailPlus,
  ticket_created: Ticket,
  ticket_status_updated: ClipboardList,
  ticket_assigned: Users,
  technician_request: Wrench,
};

export function getBusinessEmailSettingsGroupsWithIcons(): BusinessEmailSettingsGroupMeta[] {
  return emailTemplateGroups.map((group) => ({
    ...group,
    icon: GROUP_ICONS[group.id] ?? Send,
    templates: group.templates.map((template) => ({
      ...template,
      key: template.key as BusinessEmailTemplateKey,
      icon: TEMPLATE_ICONS[template.key as BusinessEmailTemplateKey] ?? MessageSquareText,
    })),
  }));
}

// ----- App (platform) templates -----

export type AppEmailSettingsTemplateMeta = AppEmailTemplateRegistryEntry & {
  icon: LucideIcon;
};

export type AppEmailSettingsGroupMeta = {
  id: AppEmailTemplateGroupId;
  title: string;
  description: string;
  icon: LucideIcon;
  templates: AppEmailSettingsTemplateMeta[];
};

const APP_GROUP_ICONS: Record<AppEmailTemplateGroupId, LucideIcon> = {
  workspace: Building2,
  access: Shield,
  security: KeyRound,
};

const APP_TEMPLATE_ICONS: Record<
  AppEmailTemplateRegistryEntry["key"],
  LucideIcon
> = {
  [APP_EMAIL_TEMPLATE.BUSINESS_REGISTRATION]: Building2,
  [APP_EMAIL_TEMPLATE.WORKSPACE_CREATED]: Building2,
  [APP_EMAIL_TEMPLATE.WORKSPACE_UPGRADED]: Building2,
  [APP_EMAIL_TEMPLATE.BUSINESS_DEACTIVATED]: Shield,
  [APP_EMAIL_TEMPLATE.BUSINESS_ACTIVATED]: Shield,
  [APP_EMAIL_TEMPLATE.TEAM_INVITE]: MailPlus,
  [APP_EMAIL_TEMPLATE.TEAM_WELCOME]: Users,
  [APP_EMAIL_TEMPLATE.FORGOT_PASSWORD]: KeyRound,
  [APP_EMAIL_TEMPLATE.PASSWORD_CHANGE_PASSCODE]: KeyRound,
  [APP_EMAIL_TEMPLATE.PASSWORD_UPDATED]: KeyRound,
  [APP_EMAIL_TEMPLATE.PASSWORDLESS_LOGIN]: KeyRound,
};

export function getAppEmailSettingsGroupsWithIcons(): AppEmailSettingsGroupMeta[] {
  return getAppEmailSettingsGroups().map((group) => ({
    ...group,
    icon: APP_GROUP_ICONS[group.id],
    templates: group.templates.map((template) => ({
      ...template,
      icon: APP_TEMPLATE_ICONS[template.key],
    })),
  }));
}
