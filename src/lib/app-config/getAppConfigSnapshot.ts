import "server-only";

import AppConfig, {
  defaultAppSettings,
  type AppSecuritySettingsShape,
} from "@/models/appConfigModel";

export async function getAppConfigSnapshot() {
  let config = await AppConfig.findOne({ key: "default" })
    .select({ settings: 1 })
    .lean<{ settings?: { security?: Partial<AppSecuritySettingsShape> } } | null>();

  if (!config) {
    try {
      await AppConfig.create({
        key: "default",
        settings: { security: { ...defaultAppSettings.security } },
      });
      config = await AppConfig.findOne({ key: "default" })
        .select({ settings: 1 })
        .lean<{ settings?: { security?: Partial<AppSecuritySettingsShape> } } | null>();
    } catch {
      config = await AppConfig.findOne({ key: "default" })
        .select({ settings: 1 })
        .lean<{ settings?: { security?: Partial<AppSecuritySettingsShape> } } | null>();
    }
  }

  return {
    settings: {
      security: {
        ...defaultAppSettings.security,
        ...(config?.settings?.security ?? {}),
        passwordPolicy: {
          ...defaultAppSettings.security.passwordPolicy,
          ...(config?.settings?.security?.passwordPolicy ?? {}),
        },
      },
    },
  };
}
