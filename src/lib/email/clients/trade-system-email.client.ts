import { Resend } from "resend";

import {
  buildStandardEmailBody,
  wrapWithBrandedEmailShell,
} from "@/lib/email/helpers/email-shell";
import { DEFAULT_APP_EMAIL_SETTINGS } from "@/lib/email/defaults/default-app-email-template";

function appName() {
  return process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Properly";
}

type DeliveryResult =
  | { sent: true; messageId?: string }
  | { sent: false; error?: string; skippedReason?: string };

const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Lean transactional sender for trade-flow system notifications:
 * workspace-invite emails, broadcast emails to matched trades, etc.
 *
 * Unlike `sendBusinessTemplateEmail` / `sendAppTemplateEmail`, this does
 * NOT route through the template registry — these emails are system
 * messages, not workspace-configurable content. Subject + HTML body are
 * supplied directly. Failures are returned, never thrown — every caller
 * sends best-effort and logs.
 */
export async function sendTradeSystemEmail(args: {
  to: string;
  subject: string;
  preheader?: string;
  bodyText?: string;
  bodyHtml?: string;
  replyTo?: string;
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

  const contentHtml =
    args.bodyHtml ??
    buildStandardEmailBody({
      preheader: args.preheader ?? "",
      bodyText: args.bodyText ?? "",
      footer: "",
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
      subject: args.subject,
      html,
      reply_to:
        args.replyTo ||
        process.env.APP_SUPPORT_EMAIL ||
        DEFAULT_APP_EMAIL_SETTINGS.replyTo,
    });
    if (result.error) {
      return { sent: false, error: result.error.message || "Email send failed" };
    }
    return { sent: true, messageId: result.data?.id };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
