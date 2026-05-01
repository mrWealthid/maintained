export type MergeValue = string | number | boolean | null | undefined;
export type MergeVars = Record<string, MergeValue>;

export type DeliveryResult = {
  sent: boolean;
  skippedReason?: string;
  messageId?: string;
  error?: string;
};

export type EmailAttachment = {
  filename: string;
  content: string;
  contentType?: string;
  contentId?: string;
};

export type EmailTemplateConfig = {
  enabled: boolean;
  subject: string;
  preheader: string;
  body: string;
  delay: "immediate" | "1h" | "24h" | "48h" | "custom";
  customDelayMinutes?: number;
  triggerDescription: string;
  includeUnsubscribe?: boolean;
  replyToOverride?: string;
};

export type EmailSettings<TTemplateKey extends string> = {
  senderName?: string;
  senderEmail?: string;
  replyTo?: string;
  bcc?: string;
  footer?: string;
  templates?: Partial<Record<TTemplateKey, EmailTemplateConfig>>;
};
