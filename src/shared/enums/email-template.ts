export const APP_EMAIL_TEMPLATE = {
  FORGOT_PASSWORD: "forgot_password",
  PASSWORD_CHANGE_PASSCODE: "password_change_passcode",
  PASSWORDLESS_LOGIN: "passwordless_login",
} as const;

export type AppEmailTemplateKey =
  (typeof APP_EMAIL_TEMPLATE)[keyof typeof APP_EMAIL_TEMPLATE];

export const APP_EMAIL_TEMPLATE_KEYS = Object.values(APP_EMAIL_TEMPLATE);

export const BUSINESS_EMAIL_TEMPLATE = {
  TEAM_INVITE: "team_invite",
  TICKET_CREATED: "ticket_created",
  TICKET_STATUS_UPDATED: "ticket_status_updated",
  TICKET_ASSIGNED: "ticket_assigned",
  TECHNICIAN_REQUEST: "technician_request",
} as const;

export type BusinessEmailTemplateKey =
  (typeof BUSINESS_EMAIL_TEMPLATE)[keyof typeof BUSINESS_EMAIL_TEMPLATE];

export const BUSINESS_EMAIL_TEMPLATE_KEYS = Object.values(BUSINESS_EMAIL_TEMPLATE);
