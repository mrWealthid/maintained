import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import {
  DEFAULT_EMAIL_SETTINGS,
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_KEYS,
  type BusinessEmailTemplateKey,
} from "@/lib/email/defaults/default-business-email-template";
import type { EmailSettings, EmailTemplateConfig } from "@/lib/email/models/email.model";
import Business from "@/models/businessModel";
import { PERMISSION } from "@/shared/auth/permission-registry";

connect();

const emailOrEmpty = z.union([z.string().trim().email(), z.literal("")]);

const emailTemplateSchema = z.object({
  enabled: z.boolean(),
  subject: z.string().optional().default(""),
  preheader: z.string().optional().default(""),
  body: z.string().optional().default(""),
  delay: z
    .enum(["immediate", "1h", "24h", "48h", "custom"])
    .optional()
    .default("immediate"),
  customDelayMinutes: z.number().int().min(1).max(10080).optional(),
  triggerDescription: z.string().optional().default(""),
  includeUnsubscribe: z.boolean().optional().default(false),
  replyToOverride: emailOrEmpty.optional().default(""),
});

const updateEmailSettingsSchema = z.object({
  replyTo: emailOrEmpty.optional(),
  bcc: z.string().trim().optional(),
  templates: z
    .record(z.enum(EMAIL_TEMPLATE_KEYS as [BusinessEmailTemplateKey, ...BusinessEmailTemplateKey[]]), emailTemplateSchema)
    .optional(),
});

function normalizeTemplates(
  templates?: Partial<Record<BusinessEmailTemplateKey, EmailTemplateConfig>>
) {
  return EMAIL_TEMPLATE_KEYS.reduce<Record<BusinessEmailTemplateKey, EmailTemplateConfig>>(
    (out, key) => {
      out[key] = {
        ...DEFAULT_EMAIL_TEMPLATES[key],
        ...(templates?.[key] ?? {}),
      };
      return out;
    },
    {} as Record<BusinessEmailTemplateKey, EmailTemplateConfig>
  );
}

function mergeEmailSettings(
  raw?: EmailSettings<BusinessEmailTemplateKey>
): EmailSettings<BusinessEmailTemplateKey> & {
  templates: Record<BusinessEmailTemplateKey, EmailTemplateConfig>;
} {
  return {
    senderName: raw?.senderName || DEFAULT_EMAIL_SETTINGS.senderName,
    senderEmail: raw?.senderEmail || DEFAULT_EMAIL_SETTINGS.senderEmail,
    replyTo: raw?.replyTo ?? DEFAULT_EMAIL_SETTINGS.replyTo,
    bcc: raw?.bcc ?? DEFAULT_EMAIL_SETTINGS.bcc,
    footer: raw?.footer || DEFAULT_EMAIL_SETTINGS.footer,
    templates: normalizeTemplates(raw?.templates),
  };
}

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.SETTINGS_VIEW);

    const business = await Business.findById(verify.businessId)
      .select("settings.email")
      .lean<{ settings?: { email?: EmailSettings<BusinessEmailTemplateKey> } } | null>();

    if (!business) throw ApiError.notFound("Workspace not found");

    return NextResponse.json({
      status: "success",
      data: mergeEmailSettings(business.settings?.email),
      meta: {
        permissions: {
          canViewBusinessSenderIdentity: true,
          canEditBusinessReplyRouting: true,
          canManageTemplates: true,
        },
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function PUT(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();

    await assertWorkspacePermissionKey(verify, PERMISSION.SETTINGS_EMAIL_MANAGE);
    const body = parseOrThrow(updateEmailSettingsSchema, await request.json());

    const business = await Business.findById(verify.businessId).select("settings.email");
    if (!business) throw ApiError.notFound("Workspace not found");

    const current = mergeEmailSettings(
      business.get("settings.email") as EmailSettings<BusinessEmailTemplateKey> | undefined
    );
    const nextEmail = {
      ...current,
      replyTo: body.replyTo ?? current.replyTo,
      bcc: body.bcc ?? current.bcc,
      templates: normalizeTemplates({
        ...current.templates,
        ...(body.templates ?? {}),
      }),
    };

    business.set("settings.email", nextEmail);
    await business.save();

    return NextResponse.json({
      status: "success",
      data: mergeEmailSettings(
        business.get("settings.email") as EmailSettings<BusinessEmailTemplateKey>
      ),
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
