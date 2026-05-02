import {
  BUSINESS_EMAIL_TEMPLATE,
  BUSINESS_EMAIL_TEMPLATE_KEYS,
  type BusinessEmailTemplateKey,
} from "@/shared/enums/email-template";
import type { EmailTemplateConfig } from "@/lib/email/models/email.model";

export const EMAIL_TEMPLATE_KEYS = BUSINESS_EMAIL_TEMPLATE_KEYS;
export type { BusinessEmailTemplateKey, EmailTemplateConfig };

export const DEFAULT_EMAIL_SETTINGS = {
  senderName: "Maintainly",
  senderEmail: "support@wealthtech.website",
  replyTo: "",
  bcc: "",
  footer:
    "You are receiving this email from {{business_name}} through {{app_name}}.",
} as const;

export const DEFAULT_EMAIL_TEMPLATES: Record<
  BusinessEmailTemplateKey,
  EmailTemplateConfig
> = {
  [BUSINESS_EMAIL_TEMPLATE.TEAM_INVITE]: {
    enabled: true,
    subject: "You have been invited to join {{business_name}}",
    preheader: "Complete onboarding to access your Maintainly workspace.",
    body: `Hi {{attendee_name}},

You have been invited to join {{business_name}} on {{app_name}}.

Use the secure onboarding link below to create your account or finish setup:
{{invite_url}}

This invite expires in {{invite_expires_hours}} hours.`,
    delay: "immediate",
    triggerDescription:
      "Sent when a workspace admin invites or re-invites a team member, tenant, or technician.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [BUSINESS_EMAIL_TEMPLATE.TICKET_CREATED]: {
    enabled: true,
    subject: "Maintenance request received: {{ticket_title}}",
    preheader: "Your request has been received and is ready for review.",
    body: `Hi {{attendee_name}},

Your maintenance request has been received.

Ticket: {{ticket_title}}
Priority: {{ticket_priority}}
Location: {{property_name}} {{unit_label}}

We will notify you when the status changes.`,
    delay: "immediate",
    triggerDescription:
      "Sent when a tenant submits a new maintenance ticket.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [BUSINESS_EMAIL_TEMPLATE.TICKET_STATUS_UPDATED]: {
    enabled: true,
    subject: "Ticket status updated: {{ticket_title}}",
    preheader: "There is an update on your maintenance request.",
    body: `Hi {{attendee_name}},

The status of your maintenance ticket has changed.

Ticket: {{ticket_title}}
Status: {{ticket_status}}
Update: {{ticket_update}}

Open ticket: {{ticket_url}}`,
    delay: "immediate",
    triggerDescription:
      "Sent when a ticket status changes or an admin posts a tenant-facing update.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [BUSINESS_EMAIL_TEMPLATE.TICKET_ASSIGNED]: {
    enabled: true,
    subject: "Ticket assigned: {{ticket_title}}",
    preheader: "A technician or team member has been assigned.",
    body: `Hi {{attendee_name}},

{{assignee_name}} has been assigned to this maintenance ticket.

Ticket: {{ticket_title}}
Location: {{property_name}} {{unit_label}}

Open ticket: {{ticket_url}}`,
    delay: "immediate",
    triggerDescription:
      "Sent when a ticket is assigned to a technician or staff member.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
  [BUSINESS_EMAIL_TEMPLATE.TECHNICIAN_REQUEST]: {
    enabled: true,
    subject: "Technician request: {{ticket_title}}",
    preheader: "Review the maintenance request and respond with availability.",
    body: `Hi {{attendee_name}},

You have a technician request from {{business_name}}.

Ticket: {{ticket_title}}
Priority: {{ticket_priority}}
Location: {{property_name}} {{unit_label}}

Respond here: {{technician_request_url}}`,
    delay: "immediate",
    triggerDescription:
      "Sent when a workspace requests a technician response for a ticket.",
    includeUnsubscribe: false,
    replyToOverride: "",
  },
};
