import { DEFAULT_PASSWORD_POLICY } from "@/lib/security/password-policy.shared";
import type { AppSettingsFormValues } from "../models/app-settings-form.model";

export const defaultAppSettings: AppSettingsFormValues["settings"] = {
  security: {
    require2fa: false,
    enableSSO: false,
    passwordlessLogin: false,
    passwordPolicy: { ...DEFAULT_PASSWORD_POLICY },
  },
};
