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

const AppSettingsPatchSchema = z.object({
  settings: z.object({
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
    return NextResponse.json({
      status: "success",
      data: { settings: { security } },
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

    const existing = await AppConfig.findOne({ key: "default" });
    const config =
      existing ??
      (await AppConfig.create({
        key: "default",
        settings: { security: { ...defaultAppSettings.security } },
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

    config.settings = {
      ...(config.settings ?? {}),
      security: nextSecurity,
    };
    config.markModified("settings");
    await config.save();

    return NextResponse.json({
      status: "success",
      data: { settings: { security: nextSecurity } },
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
