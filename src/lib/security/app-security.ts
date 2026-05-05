import "server-only";

import { getAppConfigSnapshot } from "@/lib/app-config/getAppConfigSnapshot";
import { defaultAppSettings } from "@/models/appConfigModel";

export type AppSecuritySettings = typeof defaultAppSettings.security;

export async function getAppSecuritySettings(): Promise<AppSecuritySettings> {
  const snapshot = await getAppConfigSnapshot();

  return {
    ...defaultAppSettings.security,
    ...(snapshot.settings.security ?? {}),
    passwordPolicy: {
      ...defaultAppSettings.security.passwordPolicy,
      ...(snapshot.settings.security?.passwordPolicy ?? {}),
    },
  };
}
