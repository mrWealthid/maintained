import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import {
  defaultBusinessSecuritySettings,
  mergeBusinessSecuritySettings,
} from "@/lib/security/business-security";
import { getRequestSecurityContext } from "@/lib/security/request-context";
import {
  getInvalidIpAddresses,
  normalizeIpAddressList,
} from "@/lib/security/ip-address";
import Business from "@/models/businessModel";
import { PERMISSION } from "@/shared/auth/permission-registry";

const securitySettingsSchema = z.object({
  require2fa: z.boolean().default(false),
  sessionTimeoutMinutes: z.coerce.number().int().min(5).max(1440),
  maxActiveSessions: z.union([
    z.literal(1),
    z.literal(3),
    z.literal(5),
    z.literal("unlimited"),
  ]),
  ipWhitelist: z.object({
    enabled: z.boolean(),
    ips: z.array(z.string()).default([]),
  }),
});

export async function GET(request: NextRequest) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized("Authentication required");

    await assertWorkspacePermissionKey(verify, PERMISSION.SETTINGS_VIEW);

    const [business, requestContext] = await Promise.all([
      Business.findById(verify.businessId)
        .select("settings.security")
        .lean<{
          settings?: {
            security?: Partial<typeof defaultBusinessSecuritySettings>;
          };
        } | null>(),
      getRequestSecurityContext(request),
    ]);

    return NextResponse.json({
      status: "success",
      data: {
        ...mergeBusinessSecuritySettings(business?.settings?.security),
        currentRequestIp: requestContext.ipAddress,
      },
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized("Authentication required");

    await assertWorkspacePermissionKey(
      verify,
      PERMISSION.SETTINGS_SECURITY_MANAGE,
    );

    const payload = parseOrThrow(securitySettingsSchema, await request.json());
    const ips = normalizeIpAddressList(payload.ipWhitelist.ips);
    const invalidIps = getInvalidIpAddresses(payload.ipWhitelist.ips);

    if (invalidIps.length > 0) {
      throw ApiError.badRequest(
        `Invalid IP address entries: ${invalidIps.slice(0, 3).join(", ")}`,
      );
    }

    if (payload.ipWhitelist.enabled && ips.length === 0) {
      throw ApiError.badRequest(
        "Add at least one allowed IP address before enabling IP whitelisting.",
      );
    }

    const nextSecurity = {
      require2fa: payload.require2fa,
      sessionTimeoutMinutes: payload.sessionTimeoutMinutes,
      maxActiveSessions: payload.maxActiveSessions,
      ipWhitelist: {
        enabled: payload.ipWhitelist.enabled,
        ips,
      },
    };

    const business = await Business.findByIdAndUpdate(
      verify.businessId,
      { $set: { "settings.security": nextSecurity } },
      { new: true },
    )
      .select("settings.security")
      .lean<{
        settings?: {
          security?: Partial<typeof defaultBusinessSecuritySettings>;
        };
      } | null>();

    return NextResponse.json({
      status: "success",
      data: mergeBusinessSecuritySettings(business?.settings?.security),
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
