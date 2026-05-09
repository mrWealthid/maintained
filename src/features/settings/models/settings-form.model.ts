import type {
  BusinessEmailSettings,
  BusinessEmailTemplateKey,
  EmailTemplateSetting,
  NotificationPreferences,
  WorkspaceProfileSettings,
  WorkspaceSecuritySettings,
} from "./settings.model";

const emptyTemplate: EmailTemplateSetting = {
  enabled: false,
  subject: "",
  preheader: "",
  body: "",
  delay: "immediate",
  triggerDescription: "",
  includeUnsubscribe: false,
  replyToOverride: "",
};

const templateKeys: BusinessEmailTemplateKey[] = [
  "team_invite",
  "ticket_created",
  "ticket_status_updated",
  "ticket_assigned",
  "technician_request",
];

export const defaultWorkspaceProfileSettings: WorkspaceProfileSettings = {
  personalProfile: {
    name: "",
    email: "",
    contact: "",
    countryCode: "US",
  },
  business: {
    name: "",
    email: "",
    contact: "",
    countryCode: "US",
    logo: "",
    description: "",
    workspaceType: "BUSINESS",
    addressStructured: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      countryCode: "US",
      country: "United States",
      placeId: "",
      source: "manual",
    },
  },
  settings: {
    general: {
      timezone: "America/New_York",
      dateFormat: "mdy",
      timeFormat: "12h",
      language: "en",
      integrations: {
        googleCalendar: { connected: false },
        slack: { connected: false },
        mailchimp: { connected: false },
        zapier: { connected: false },
      },
    },
  },
  meta: {
    permissions: {
      isBusinessCreator: false,
      canEditBusinessDetails: false,
    },
  },
};

export const defaultNotificationPreferences: NotificationPreferences = {
  ticketCreatedAlerts: true,
  ticketStatusAlerts: true,
  ticketAssignmentAlerts: true,
  technicianRequestAlerts: true,
  tenantMessageAlerts: true,
  commentAlerts: true,
  emailFrequency: "immediate",
  smsPreference: "urgent",
  pushPreference: "important",
};

export const defaultBusinessEmailSettings: BusinessEmailSettings = {
  senderName: "",
  senderEmail: "",
  replyTo: "",
  bcc: "",
  footer: "",
  templates: Object.fromEntries(
    templateKeys.map((key) => [key, { ...emptyTemplate }]),
  ) as BusinessEmailSettings["templates"],
};

export const defaultWorkspaceSecuritySettings: WorkspaceSecuritySettings = {
  require2fa: false,
  sessionTimeoutMinutes: 60,
  maxActiveSessions: "unlimited",
  ipWhitelist: {
    enabled: false,
    ips: [],
  },
  currentRequestIp: null,
};

export type WorkspaceSettingsFormValues = {
  general: WorkspaceProfileSettings;
  notifications: NotificationPreferences;
  email: BusinessEmailSettings;
  security: WorkspaceSecuritySettings;
};

export const defaultWorkspaceSettingsFormValues: WorkspaceSettingsFormValues = {
  general: defaultWorkspaceProfileSettings,
  notifications: defaultNotificationPreferences,
  email: defaultBusinessEmailSettings,
  security: defaultWorkspaceSecuritySettings,
};
