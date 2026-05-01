import "server-only";

import Business from "@/models/businessModel";
import {
  normalizeIpAddress,
  normalizeIpAddressList,
} from "@/lib/security/ip-address";

export const defaultBusinessSecuritySettings = {
  require2fa: false,
  sessionTimeoutMinutes: 60,
  maxActiveSessions: "unlimited" as 1 | 3 | 5 | "unlimited",
  ipWhitelist: {
    enabled: false,
    ips: [] as string[],
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
