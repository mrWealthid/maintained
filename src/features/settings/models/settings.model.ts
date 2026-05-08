import type { PermissionKey } from "@/shared/auth/permission-registry";
import { z } from "zod";

const integrationStateSchema = z.object({
  connected: z.boolean(),
});

const workspaceGeneralSettingsSchema = z.object({
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

const addressStructuredSchema = z
  .object({
    line1: z.string().optional().default(""),
    line2: z.string().optional().default(""),
    city: z.string().optional().default(""),
    state: z.string().optional().default(""),
    postalCode: z.string().optional().default(""),
    countryCode: z.string().optional().default("US"),
    country: z.string().optional().default("United States"),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
    placeId: z.string().optional().default(""),
    source: z.enum(["google", "manual"]).optional().default("manual"),
  })
  .passthrough();

export const WorkspaceProfileSettingsSchema = z.object({
  personalProfile: z.object({
    name: z.string().trim().min(2, "Name is required").max(120),
    email: z.string().email("Enter a valid email"),
    contact: z.string().trim().optional().default(""),
    countryCode: z.string().trim().max(4).optional().default("US"),
  }),
  business: z.object({
    name: z.string().trim().min(2, "Workspace name is required").max(160),
    email: z.string().email("Enter a valid email"),
    contact: z.string().trim().optional().default(""),
    countryCode: z.string().trim().max(4).optional().default("US"),
    logo: z.string().optional().default(""),
    description: z.string().trim().optional().default(""),
    workspaceType: z.enum(["BUSINESS", "INDIVIDUAL"]),
    addressStructured: addressStructuredSchema.optional(),
  }),
  settings: z.object({
    general: workspaceGeneralSettingsSchema,
  }),
  meta: z.object({
    permissions: z.object({
      isBusinessCreator: z.boolean(),
      canEditBusinessDetails: z.boolean(),
    }),
  }),
});

export interface NotificationPreferences {
  ticketCreatedAlerts: boolean;
  ticketStatusAlerts: boolean;
  ticketAssignmentAlerts: boolean;
  technicianRequestAlerts: boolean;
  tenantMessageAlerts: boolean;
  commentAlerts: boolean;
  emailFrequency: "immediate" | "hourly" | "daily" | "weekly" | "off";
  smsPreference: "all" | "urgent" | "off";
  pushPreference: "all" | "important" | "off";
  mode?: "SMS" | "EMAIL" | "PHONE";
  smsEnabled?: boolean;
  emailEnabled?: boolean;
  phoneEnabled?: boolean;
}

export type PersonalProfileSettings = z.infer<
  typeof WorkspaceProfileSettingsSchema
>["personalProfile"];

export type WorkspaceProfileSettings = z.infer<
  typeof WorkspaceProfileSettingsSchema
>;

export type WorkspaceGeneralSettings = WorkspaceProfileSettings["settings"]["general"];

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passcode: string;
}

export interface WorkspaceSecuritySettings {
  require2fa: boolean;
  sessionTimeoutMinutes: number;
  maxActiveSessions: 1 | 3 | 5 | "unlimited";
  ipWhitelist: {
    enabled: boolean;
    ips: string[];
  };
  currentRequestIp?: string | null;
}

export interface PlatformPasswordPolicy {
  minLength: number;
  expiryDays: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
}

export interface PlatformSecuritySettings {
  require2fa: boolean;
  enableSSO: boolean;
  passwordlessLogin: boolean;
  passwordPolicy: PlatformPasswordPolicy;
}

export type SecuritySessionSummary = {
  sessionId: string;
  current: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastSeenAt: string;
};

export interface CategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface TicketTypeFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

export type BusinessEmailTemplateKey =
  | "team_invite"
  | "ticket_created"
  | "ticket_status_updated"
  | "ticket_assigned"
  | "technician_request";

export type EmailTemplateDelay = "immediate" | "1h" | "24h" | "48h" | "custom";

export interface EmailTemplateSetting {
  enabled: boolean;
  subject: string;
  preheader: string;
  body: string;
  delay: EmailTemplateDelay;
  customDelayMinutes?: number;
  triggerDescription: string;
  includeUnsubscribe?: boolean;
  replyToOverride?: string;
}

export interface BusinessEmailSettings {
  senderName: string;
  senderEmail: string;
  replyTo: string;
  bcc: string;
  footer: string;
  templates: Record<BusinessEmailTemplateKey, EmailTemplateSetting>;
}

export type EmailSettingsUpdateData = Pick<
  BusinessEmailSettings,
  "replyTo" | "bcc" | "templates"
>;

export interface SettingsTab {
  id: string;
  label: string;
  icon: React.ElementType;
  permission?: PermissionKey;
}
