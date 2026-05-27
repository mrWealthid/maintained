import { Resend } from "resend";
import Business from "@/models/businessModel";
import {
  DEFAULT_EMAIL_SETTINGS,
  DEFAULT_EMAIL_TEMPLATES,
  type BusinessEmailTemplateKey,
} from "@/lib/email/defaults/default-business-email-template";
import {
  buildStandardEmailBody,
  wrapWithBrandedEmailShell,
} from "@/lib/email/helpers/email-shell";
import {
  normalizeTemplateText,
  parseBcc,
  renderTemplate,
} from "@/lib/email/helpers/email-html";
import type {
  DeliveryResult,
  EmailAttachment,
  EmailSettings,
  MergeVars,
} from "@/lib/email/models/email.model";

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type BusinessEmailSettings = EmailSettings<BusinessEmailTemplateKey>;

function appName() {
  return process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Properly";
}

async function loadBusinessEmailSettings(businessId: string) {
  const business = await Business.findById(businessId)
    .select("name email settings.email")
    .lean<{
      name?: string;
      email?: string;
      settings?: { email?: BusinessEmailSettings };
    } | null>();

  return {
    business,
    email: business?.settings?.email ?? {},
  };
}

export async function sendBusinessTemplateEmail(args: {
  businessId: string;
  templateKey: BusinessEmailTemplateKey;
  to: string;
  variables: MergeVars;
  fallbackSubject: string;
  subjectOverride?: string;
  preheaderOverride?: string;
  replyTo?: string;
  customBodyHtml?: string;
  attachments?: EmailAttachment[];
}): Promise<DeliveryResult> {
  if (!resendClient) {
    return { sent: false, skippedReason: "RESEND_API_KEY is not configured" };
  }

  const { business, email } = await loadBusinessEmailSettings(args.businessId);
  if (!business) {
    return { sent: false, error: "Business not found" };
  }

  const senderEmail =
    email.senderEmail?.trim() ||
    process.env.BUSINESS_EMAIL_SENDER_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    DEFAULT_EMAIL_SETTINGS.senderEmail;
  const senderName =
    email.senderName?.trim() || business.name || DEFAULT_EMAIL_SETTINGS.senderName;
  const configuredTemplate = email.templates?.[args.templateKey];
  const template = configuredTemplate ?? DEFAULT_EMAIL_TEMPLATES[args.templateKey];

  if (!template?.enabled) {
    return { sent: false, skippedReason: "Template is disabled" };
  }

  const variables: MergeVars = {
    app_name: appName(),
    business_name: business.name ?? "Workspace",
    support_email:
      email.replyTo?.trim() || business.email || DEFAULT_EMAIL_SETTINGS.senderEmail,
    ...args.variables,
  };
  const subject = renderTemplate(
    args.subjectOverride?.trim() || template.subject?.trim() || args.fallbackSubject,
    variables,
  );
  const preheader = renderTemplate(
    args.preheaderOverride ?? template.preheader ?? "",
    variables,
  );
  const bodyText = renderTemplate(normalizeTemplateText(template.body), variables);
  const footer = renderTemplate(email.footer || DEFAULT_EMAIL_SETTINGS.footer, variables);
  const contentHtml =
    args.customBodyHtml ??
    buildStandardEmailBody({
      preheader,
      bodyText,
      footer,
    });
  const html = wrapWithBrandedEmailShell({
    appName: appName(),
    senderName,
    contentHtml,
  });
  const replyTo =
    args.replyTo ||
    template.replyToOverride ||
    email.replyTo ||
    business.email ||
    undefined;

  try {
    const result = await resendClient.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: args.to,
      subject,
      html,
      reply_to: replyTo,
      bcc: parseBcc(email.bcc),
      attachments: args.attachments,
    });

    if (result.error) {
      return {
        sent: false,
        error: result.error.message || "Unable to send email",
      };
    }

    return { sent: true, messageId: result.data?.id };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

export async function sendBusinessTransactionalEmail(args: {
  businessId: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}): Promise<DeliveryResult> {
  if (!resendClient) {
    return { sent: false, skippedReason: "RESEND_API_KEY is not configured" };
  }

  const { business, email } = await loadBusinessEmailSettings(args.businessId);
  if (!business) {
    return { sent: false, error: "Business not found" };
  }

  const senderEmail =
    email.senderEmail?.trim() ||
    process.env.BUSINESS_EMAIL_SENDER_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    DEFAULT_EMAIL_SETTINGS.senderEmail;
  const senderName =
    email.senderName?.trim() || business.name || DEFAULT_EMAIL_SETTINGS.senderName;
  const html = wrapWithBrandedEmailShell({
    appName: appName(),
    senderName,
    contentHtml: args.html,
  });

  try {
    const result = await resendClient.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: args.to,
      subject: args.subject,
      html,
      reply_to: args.replyTo || email.replyTo || business.email || undefined,
      bcc: parseBcc(email.bcc),
      attachments: args.attachments,
    });

    if (result.error) {
      return {
        sent: false,
        error: result.error.message || "Unable to send email",
      };
    }

    return { sent: true, messageId: result.data?.id };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
