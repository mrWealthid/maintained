import type { PermissionKey } from "@/shared/auth/permission-registry";

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
