export const REPORT_KEY = {
  EXECUTIVE_OVERVIEW: "executive_overview",
  TABLE_EXPORT: "table_export",
  EVENT_DETAILS: "event_details",
  POST_EVENT_CLOSEOUT: "post_event_closeout",
  RESERVATION_PERFORMANCE: "reservation_performance",
  VOLUNTEER_PERFORMANCE: "volunteer_performance",
  PAYMENT_RECONCILIATION: "payment_reconciliation",
  SURVEY_INSIGHTS: "survey_insights",
} as const;

export const REPORT_CATEGORY = {
  EXECUTIVE: "executive",
  OPERATIONS: "operations",
  ATTENDANCE: "attendance",
  FINANCE: "finance",
  SURVEY: "survey",
} as const;

export const REPORT_SOURCE_TYPE = {
  LIVE: "live",
  SNAPSHOT: "snapshot",
  PROJECTION: "projection",
} as const;

export const REPORT_CERTIFICATION_MODE = {
  NONE: "none",
  OPTIONAL: "optional",
  REQUIRED: "required",
} as const;

export const REPORT_FORMAT = {
  PDF: "pdf",
  CSV: "csv",
  JSON: "json",
} as const;

export const REPORT_SCOPE = {
  BUSINESS: "business",
  EVENT: "event",
  TABLE: "table",
} as const;

export const REPORT_RUN_STATUS = {
  READY: "ready",
  FAILED: "failed",
} as const;

export const REPORT_DELIVERY_CHANNEL = {
  EMAIL_INTERNAL: "email_internal",
  EMAIL_DIRECT: "email_direct",
  SECURE_LINK: "secure_link",
} as const;

export const REPORT_DELIVERY_STATUS = {
  SENT: "sent",
  FAILED: "failed",
  SKIPPED: "skipped",
} as const;

export const REPORT_CONFIDENCE = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type ReportKey = (typeof REPORT_KEY)[keyof typeof REPORT_KEY];
export type ReportCategory =
  (typeof REPORT_CATEGORY)[keyof typeof REPORT_CATEGORY];
export type ReportSourceType =
  (typeof REPORT_SOURCE_TYPE)[keyof typeof REPORT_SOURCE_TYPE];
export type ReportCertificationMode =
  (typeof REPORT_CERTIFICATION_MODE)[keyof typeof REPORT_CERTIFICATION_MODE];
export type ReportFormat = (typeof REPORT_FORMAT)[keyof typeof REPORT_FORMAT];
export type ReportScope = (typeof REPORT_SCOPE)[keyof typeof REPORT_SCOPE];
export type ReportRunStatus =
  (typeof REPORT_RUN_STATUS)[keyof typeof REPORT_RUN_STATUS];
export type ReportDeliveryChannel =
  (typeof REPORT_DELIVERY_CHANNEL)[keyof typeof REPORT_DELIVERY_CHANNEL];
export type ReportDeliveryStatus =
  (typeof REPORT_DELIVERY_STATUS)[keyof typeof REPORT_DELIVERY_STATUS];
export type ReportConfidence =
  (typeof REPORT_CONFIDENCE)[keyof typeof REPORT_CONFIDENCE];
