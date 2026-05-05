import "server-only";

import Business from "@/models/businessModel";
import {
  normalizeIpAddress,
  normalizeIpAddressList,
} from "@/lib/security/ip-address";

export const defaultBusinessSecuritySettings = {
  require2fa: false,
  enableSSO: false,
  passwordlessLogin: false,
  sessionTimeoutMinutes: 60,
  maxActiveSessions: "unlimited" as 1 | 3 | 5 | "unlimited",
  ipWhitelist: {
    enabled: false,
    ips: [] as string[],
  },
  passwordPolicy: {
    minLength: 8,
    expiryDays: 90,
    requireUppercase: false,
    requireNumbers: false,
    requireSpecial: false,
  },
};

export type BusinessSecuritySettings =
  typeof defaultBusinessSecuritySettings;

export function mergeBusinessSecuritySettings(
  settings?: Partial<BusinessSecuritySettings> | null,
): BusinessSecuritySettings {
  return {
    ...defaultBusinessSecuritySettings,
    ...(settings ?? {}),
    ipWhitelist: {
      ...defaultBusinessSecuritySettings.ipWhitelist,
      ...(settings?.ipWhitelist ?? {}),
      ips: normalizeIpAddressList(settings?.ipWhitelist?.ips),
    },
    passwordPolicy: {
      ...defaultBusinessSecuritySettings.passwordPolicy,
      ...(settings?.passwordPolicy ?? {}),
    },
  };
}

export async function getBusinessSecuritySettings(
  businessId: string | undefined | null,
): Promise<BusinessSecuritySettings> {
  if (!businessId) {
    return mergeBusinessSecuritySettings();
  }

  const business = await Business.findById(businessId)
    .select("settings.security")
    .lean<{
      settings?: { security?: Partial<BusinessSecuritySettings> };
    } | null>();

  return mergeBusinessSecuritySettings(business?.settings?.security);
}

export function isIpAllowed(args: {
  ipAddress?: string | null;
  ips?: string[];
}) {
  const incomingIp = normalizeIpAddress(args.ipAddress);
  if (!incomingIp) return false;
  return normalizeIpAddressList(args.ips).includes(incomingIp);
}
