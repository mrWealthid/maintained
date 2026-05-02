import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  MailPlus,
  MessageSquareText,
  Send,
  Ticket,
  Users,
  Wrench,
} from "lucide-react";

import { emailTemplateGroups } from "./settings.data";
import type { BusinessEmailTemplateKey } from "../models/settings.model";

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
