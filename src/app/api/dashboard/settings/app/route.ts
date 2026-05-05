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
import AppConfig, { defaultAppSettings } from "@/models/appConfigModel";
import { getAppSecuritySettings } from "@/lib/security/app-security";

const PasswordPolicyPatchSchema = z
  .object({
    minLength: z.number().int().min(6).max(64).optional(),
    expiryDays: z.number().int().min(0).max(365).optional(),
    requireUppercase: z.boolean().optional(),
    requireNumbers: z.boolean().optional(),
    requireSpecial: z.boolean().optional(),
  })
  .partial();

const AppSecurityPatchSchema = z
  .object({
    require2fa: z.boolean().optional(),
    enableSSO: z.boolean().optional(),
    passwordlessLogin: z.boolean().optional(),
    passwordPolicy: PasswordPolicyPatchSchema.optional(),
  })
  .partial();

const IntegrationStatePatchSchema = z
  .object({ connected: z.boolean().optional() })
  .partial();

const AppGeneralPatchSchema = z
  .object({
    timezone: z.string().optional(),
    dateFormat: z.enum(["mdy", "dmy", "ymd"]).optional(),
    timeFormat: z.enum(["12h", "24h"]).optional(),
    language: z.enum(["en", "es", "fr", "de", "pt"]).optional(),
    integrations: z
      .object({
        googleCalendar: IntegrationStatePatchSchema.optional(),
        slack: IntegrationStatePatchSchema.optional(),
        mailchimp: IntegrationStatePatchSchema.optional(),
        zapier: IntegrationStatePatchSchema.optional(),
      })
      .partial()
      .optional(),
  })
  .partial();

const EmailTemplatePatchSchema = z
  .object({
    enabled: z.boolean().optional(),
    subject: z.string().optional(),
    preheader: z.string().optional(),
    body: z.string().optional(),
    delay: z.enum(["immediate", "1h", "24h", "48h", "custom"]).optional(),
    triggerDescription: z.string().optional(),
    includeUnsubscribe: z.boolean().optional(),
    replyToOverride: z.string().optional(),
    customDelayMinutes: z.number().int().min(1).max(10080).optional(),
  })
  .partial();

const AppEmailPatchSchema = z
  .object({
    senderName: z.string().min(1).optional(),
    senderEmail: z.string().email().optional(),
    replyTo: z.union([z.string().email(), z.literal("")]).optional(),
    bcc: z.union([z.string().email(), z.literal("")]).optional(),
    footer: z.string().optional(),
    templates: z.record(z.string(), EmailTemplatePatchSchema).optional(),
  })
  .partial();

const AppNotificationsPatchSchema = z
  .object({
    businessRegistrationAlerts: z.boolean().optional(),
    teamInviteAlerts: z.boolean().optional(),
    passwordResetAlerts: z.boolean().optional(),
    passwordChangeAlerts: z.boolean().optional(),
    appEmailDeliveryAlerts: z.boolean().optional(),
    emailFrequency: z
      .enum(["immediate", "hourly", "daily", "weekly", "off"])
      .optional(),
    pushPreference: z.enum(["all", "important", "off"]).optional(),
  })
  .partial();

const AppSettingsPatchSchema = z.object({
  settings: z.object({
    general: AppGeneralPatchSchema.optional(),
    notifications: AppNotificationsPatchSchema.optional(),
    email: AppEmailPatchSchema.optional(),
    security: AppSecurityPatchSchema.optional(),
  }),
});

const getRequestId = (req: NextRequest) =>
  req.headers.get("x-request-id");

async function requirePlatformSettingsAccess(
  request: NextRequest,
  permission:
    | typeof PERMISSION.PLATFORM_SETTINGS_VIEW
    | typeof PERMISSION.PLATFORM_SETTINGS_MANAGE,
) {
  const verify = await getVerifiedUser(request);
  if (!verify) throw ApiError.unauthorized();
  await assertPermission(
    {
      userId: verify.id,
      businessId: verify.businessId,
      platformRole: verify.platformRole,
      workspaceRole: verify.workspaceRole,
    },
    permission,
  );
  return verify;
}

export async function GET(request: NextRequest) {
  try {
    await connect();
    await requirePlatformSettingsAccess(
      request,
      PERMISSION.PLATFORM_SETTINGS_VIEW,
    );

    const security = await getAppSecuritySettings();
    const existing = await AppConfig.findOne({ key: "default" });
    const general = {
      ...defaultAppSettings.general,
      ...((existing?.settings?.general as Record<string, unknown>) ?? {}),
      integrations: {
        ...defaultAppSettings.general.integrations,
        ...((existing?.settings?.general as {
          integrations?: Record<string, unknown>;
        })?.integrations ?? {}),
      },
    };
    const notifications = {
      ...defaultAppSettings.notifications,
      ...((existing?.settings?.notifications as Record<string, unknown>) ?? {}),
    };
    const storedEmail =
      (existing?.settings?.email as Record<string, unknown>) ?? {};
    const storedTemplates =
      (storedEmail.templates as Record<string, unknown>) ?? {};
    const email = {
      ...defaultAppSettings.email,
      ...storedEmail,
      templates: {
        ...defaultAppSettings.email.templates,
        ...storedTemplates,
      },
    };
    return NextResponse.json({
      status: "success",
      data: { settings: { general, notifications, email, security } },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connect();
    await requirePlatformSettingsAccess(
      request,
      PERMISSION.PLATFORM_SETTINGS_MANAGE,
    );

    const { settings } = parseOrThrow(
      AppSettingsPatchSchema,
      await request.json(),
    );
    const securityPatch = settings.security ?? {};
    const generalPatch = settings.general ?? {};
    const notificationsPatch = settings.notifications ?? {};
    const emailPatch = settings.email ?? {};

    const existing = await AppConfig.findOne({ key: "default" });
    const config =
      existing ??
      (await AppConfig.create({
        key: "default",
        settings: {
          general: { ...defaultAppSettings.general },
          notifications: { ...defaultAppSettings.notifications },
          email: { ...defaultAppSettings.email },
          security: { ...defaultAppSettings.security },
        },
      }));

    const currentSecurity = {
      ...defaultAppSettings.security,
      ...((config.settings?.security as Record<string, unknown>) ?? {}),
      passwordPolicy: {
        ...defaultAppSettings.security.passwordPolicy,
        ...((config.settings?.security as {
          passwordPolicy?: Record<string, unknown>;
        })?.passwordPolicy ?? {}),
      },
    };

    const nextSecurity = {
      ...currentSecurity,
      ...securityPatch,
      passwordPolicy: {
        ...currentSecurity.passwordPolicy,
        ...(securityPatch.passwordPolicy ?? {}),
      },
    };

    const currentGeneral = {
      ...defaultAppSettings.general,
      ...((config.settings?.general as Record<string, unknown>) ?? {}),
      integrations: {
        ...defaultAppSettings.general.integrations,
        ...((config.settings?.general as {
          integrations?: Record<string, unknown>;
        })?.integrations ?? {}),
      },
    };

    const nextGeneral = {
      ...currentGeneral,
      ...generalPatch,
      integrations: {
        ...currentGeneral.integrations,
        ...Object.fromEntries(
          Object.entries(generalPatch.integrations ?? {}).map(([key, patch]) => [
            key,
            {
              ...currentGeneral.integrations[
                key as keyof typeof currentGeneral.integrations
              ],
              ...(patch ?? {}),
            },
          ]),
        ),
      },
    };

    const currentNotifications = {
      ...defaultAppSettings.notifications,
      ...((config.settings?.notifications as Record<string, unknown>) ?? {}),
    };

    const nextNotifications = {
      ...currentNotifications,
      ...notificationsPatch,
    };

    const storedEmail =
      (config.settings?.email as Record<string, unknown>) ?? {};
    const storedTemplates =
      (storedEmail.templates as Record<string, unknown>) ?? {};
    const currentEmail = {
      ...defaultAppSettings.email,
      ...storedEmail,
      templates: {
        ...defaultAppSettings.email.templates,
        ...storedTemplates,
      },
    };
    const incomingTemplates = (emailPatch.templates ?? {}) as Record<
      string,
      Record<string, unknown> | undefined
    >;
    const nextEmail = {
      ...currentEmail,
      ...emailPatch,
      templates: {
        ...currentEmail.templates,
        ...Object.fromEntries(
          Object.entries(incomingTemplates).map(([key, patch]) => [
            key,
            {
              ...((currentEmail.templates as Record<string, Record<string, unknown>>)[key] ?? {}),
              ...(patch ?? {}),
            },
          ]),
        ),
      },
    };

    config.settings = {
      ...(config.settings ?? {}),
      general: nextGeneral,
      notifications: nextNotifications,
      email: nextEmail,
      security: nextSecurity,
    };
    config.markModified("settings");
    await config.save();

    return NextResponse.json({
      status: "success",
      data: {
        settings: {
          general: nextGeneral,
          notifications: nextNotifications,
          email: nextEmail,
          security: nextSecurity,
        },
      },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
