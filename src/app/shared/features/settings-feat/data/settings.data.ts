import { SettingsTab } from "../model/settings.model";
import { Settings, Bell, Lock, FolderOpen, Ticket } from "lucide-react";

export const settingsTabs: SettingsTab[] = [
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    adminOnly: false,
  },
  {
    id: "security",
    label: "Security",
    icon: Lock,
    adminOnly: false,
  },
  {
    id: "categories",
    label: "Categories",
    icon: FolderOpen,
    adminOnly: true,
  },
  {
    id: "ticket-types",
    label: "Ticket Types",
    icon: Ticket,
    adminOnly: true,
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
