import { Resend } from "resend";
import {
  DEFAULT_APP_EMAIL_SETTINGS,
  DEFAULT_APP_EMAIL_TEMPLATES,
  type AppEmailTemplateKey,
} from "@/lib/email/defaults/default-app-email-template";
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
  MergeVars,
} from "@/lib/email/models/email.model";

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function appName() {
  return process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Properly";
}

export async function sendAppTemplateEmail(args: {
  templateKey: AppEmailTemplateKey;
  to: string;
  variables: MergeVars;
  fallbackSubject: string;
  replyTo?: string;
  customBodyHtml?: string;
  attachments?: EmailAttachment[];
}): Promise<DeliveryResult> {
  if (!resendClient) {
    return { sent: false, skippedReason: "RESEND_API_KEY is not configured" };
  }

  const senderEmail =
    process.env.APP_EMAIL_SENDER_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    DEFAULT_APP_EMAIL_SETTINGS.senderEmail;
  const senderName =
    process.env.APP_EMAIL_SENDER_NAME?.trim() ||
    DEFAULT_APP_EMAIL_SETTINGS.senderName;
  const template = DEFAULT_APP_EMAIL_TEMPLATES[args.templateKey];

  if (!template?.enabled) {
    return { sent: false, skippedReason: "Template is disabled" };
  }

  const variables: MergeVars = {
    app_name: appName(),
    support_email:
      process.env.APP_SUPPORT_EMAIL?.trim() ||
      args.replyTo ||
      DEFAULT_APP_EMAIL_SETTINGS.replyTo,
    ...args.variables,
  };
  const subject = renderTemplate(
    template.subject?.trim() || args.fallbackSubject,
    variables,
  );
  const preheader = renderTemplate(template.preheader ?? "", variables);
  const bodyText = renderTemplate(normalizeTemplateText(template.body), variables);
  const footer = renderTemplate(DEFAULT_APP_EMAIL_SETTINGS.footer, variables);
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

  try {
    const result = await resendClient.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: args.to,
      subject,
      html,
      reply_to:
        args.replyTo ||
        template.replyToOverride ||
        process.env.APP_SUPPORT_EMAIL ||
        DEFAULT_APP_EMAIL_SETTINGS.replyTo,
      bcc: parseBcc(DEFAULT_APP_EMAIL_SETTINGS.bcc),
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

/**
 * Send a one-off test email using caller-supplied template + sender values
 * (rather than reading from DEFAULT_APP_EMAIL_TEMPLATES). This is the path
 * the settings UI uses to preview unsaved edits.
 */
export async function sendAppTestEmail(args: {
  to: string;
  subject: string;
  preheader: string;
  body: string;
  footer?: string;
  variables: MergeVars;
  senderName?: string;
  senderEmail?: string;
  replyTo?: string;
  bcc?: string;
}): Promise<DeliveryResult> {
  if (!resendClient) {
    return { sent: false, skippedReason: "RESEND_API_KEY is not configured" };
  }

  const senderEmail =
    args.senderEmail?.trim() ||
    process.env.APP_EMAIL_SENDER_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    DEFAULT_APP_EMAIL_SETTINGS.senderEmail;
  const senderName =
    args.senderName?.trim() ||
    process.env.APP_EMAIL_SENDER_NAME?.trim() ||
    DEFAULT_APP_EMAIL_SETTINGS.senderName;

  const variables: MergeVars = {
    app_name: appName(),
    support_email:
      args.replyTo?.trim() ||
      process.env.APP_SUPPORT_EMAIL?.trim() ||
      DEFAULT_APP_EMAIL_SETTINGS.replyTo,
    ...args.variables,
  };
  const subject = renderTemplate(args.subject, variables);
  const preheader = renderTemplate(args.preheader, variables);
  const bodyText = renderTemplate(normalizeTemplateText(args.body), variables);
  const footer = renderTemplate(
    args.footer?.trim() || DEFAULT_APP_EMAIL_SETTINGS.footer,
    variables,
  );
  const contentHtml = buildStandardEmailBody({ preheader, bodyText, footer });
  const html = wrapWithBrandedEmailShell({
    appName: appName(),
    senderName,
    contentHtml,
  });

  try {
    const result = await resendClient.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: args.to,
      subject: `[TEST] ${subject}`,
      html,
      reply_to: args.replyTo || senderEmail,
      bcc: parseBcc(args.bcc ?? DEFAULT_APP_EMAIL_SETTINGS.bcc),
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
