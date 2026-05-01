import { SettingsTab } from "../models/settings.model";
import { Bell, FolderOpen, Lock, Mail, Ticket } from "lucide-react";
import { PERMISSION } from "@/shared/auth/permission-registry";

export const settingsTabs: SettingsTab[] = [
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    permission: PERMISSION.SETTINGS_VIEW,
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    permission: PERMISSION.SETTINGS_EMAIL_MANAGE,
  },
  {
    id: "security",
    label: "Security",
    icon: Lock,
    permission: PERMISSION.SETTINGS_VIEW,
  },
  {
    id: "categories",
    label: "Categories",
    icon: FolderOpen,
    permission: PERMISSION.TICKET_CATEGORIES_MANAGE,
  },
  {
    id: "ticket-types",
    label: "Ticket Types",
    icon: Ticket,
    permission: PERMISSION.TICKET_TYPES_MANAGE,
  },
];

export const notificationModes = [
  {
    value: "SMS",
    label: "SMS",
    description: "Receive notifications via text message",
  },
  {
    value: "EMAIL",
    label: "Email",
    description: "Receive notifications via email",
  },
  {
    value: "PHONE",
    label: "Phone Call",
    description: "Receive notifications via phone call",
  },
];

export const emailTemplateGroups = [
  {
    id: "team",
    title: "Team",
    description: "Workspace invitation and onboarding messages",
    templates: [
      {
        key: "team_invite",
        name: "Team invite",
        description: "Sent when an admin invites or re-invites a user.",
      },
    ],
  },
  {
    id: "tickets",
    title: "Tickets",
    description: "Customer-facing ticket lifecycle messages",
    templates: [
      {
        key: "ticket_created",
        name: "Ticket created",
        description: "Sent when a tenant submits a maintenance request.",
      },
      {
        key: "ticket_status_updated",
        name: "Status updated",
        description: "Sent when a ticket status or tenant-facing update changes.",
      },
      {
        key: "ticket_assigned",
        name: "Ticket assigned",
        description: "Sent when work is assigned to a technician or team member.",
      },
      {
        key: "technician_request",
        name: "Technician request",
        description: "Sent when a technician is asked to respond to a ticket.",
      },
    ],
  },
] as const;
