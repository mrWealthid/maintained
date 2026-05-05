import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertPermission } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { sendAppTestEmail } from "@/lib/email/clients/app-email.client";
import { APP_EMAIL_TEMPLATE_KEYS } from "@/shared/enums/email-template";
import type { AppEmailTemplateKey } from "@/shared/enums/email-template";
import { getAppEmailTemplatePreviewConfig } from "@/lib/email/email-template-preview";
import { normalizeSupportEmailFooterTemplate } from "@/lib/email/helpers/support-email";

const TestEmailSchema = z.object({
  templateKey: z.enum(APP_EMAIL_TEMPLATE_KEYS as [string, ...string[]]),
  to: z.string().email(),
  sender: z
    .object({
      senderName: z.string().optional(),
      senderEmail: z.string().email().optional().or(z.literal("")),
      replyTo: z.string().email().optional().or(z.literal("")),
      bcc: z.string().optional(),
      footer: z.string().optional(),
    })
    .partial()
    .optional(),
  template: z
    .object({
      subject: z.string(),
      preheader: z.string(),
      body: z.string(),
      replyToOverride: z.string().optional(),
    })
    .partial(),
});

export async function POST(request: NextRequest) {
  try {
    await connect();

    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    await assertPermission(
      {
        userId: verify.id,
        businessId: verify.businessId,
        platformRole: verify.platformRole,
        workspaceRole: verify.workspaceRole,
      },
      PERMISSION.PLATFORM_SETTINGS_MANAGE,
    );

    const body = parseOrThrow(TestEmailSchema, await request.json());
    const templateKey = body.templateKey as AppEmailTemplateKey;
    const sender = body.sender ?? {};

    const previewVariables = getAppEmailTemplatePreviewConfig(templateKey, {
      app_name: sender.senderName?.trim() || undefined,
      support_email:
        body.template.replyToOverride?.trim() ||
        sender.replyTo?.trim() ||
        sender.senderEmail?.trim() ||
        undefined,
    }).variables;

    const footer = normalizeSupportEmailFooterTemplate(
      sender.footer?.trim(),
      undefined,
    );

    const result = await sendAppTestEmail({
      to: body.to,
      subject: body.template.subject || "(no subject)",
      preheader: body.template.preheader ?? "",
      body: body.template.body ?? "",
      footer,
      variables: previewVariables,
      senderName: sender.senderName,
      senderEmail: sender.senderEmail || undefined,
      replyTo:
        body.template.replyToOverride ||
        sender.replyTo ||
        undefined,
      bcc: sender.bcc,
    });

    if (!result.sent) {
      return NextResponse.json(
        {
          status: "error",
          message: result.error || result.skippedReason || "Email not sent",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      status: "success",
      data: { messageId: result.messageId },
      message: `Test email sent to ${body.to}`,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
