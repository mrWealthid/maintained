import "server-only";

import { ApiError } from "@/lib/errors/apiError";
import { getAppConfigSnapshot } from "@/lib/app-config/getAppConfigSnapshot";
import { defaultAppSettings } from "@/models/appConfigModel";
import {
  getPasswordPolicyValidationMessage,
  type PasswordPolicy,
} from "@/lib/security/password-policy.shared";

export async function getAppPasswordPolicy(): Promise<PasswordPolicy> {
  const snapshot = await getAppConfigSnapshot();
  return {
    ...defaultAppSettings.security.passwordPolicy,
    ...(snapshot.settings.security?.passwordPolicy ?? {}),
  };
}

export function assertPasswordPolicy(password: string, policy: PasswordPolicy) {
  const validationMessage = getPasswordPolicyValidationMessage(password, policy);
  if (validationMessage) {
    throw ApiError.badRequest(validationMessage);
  }
}

export function isPasswordExpired(args: {
  passwordChangedAt?: Date | string | null;
  fallbackDate?: Date | string | null;
  policy: PasswordPolicy;
  now?: Date;
}) {
  if (args.policy.expiryDays <= 0) {
    return false;
  }

  const now = args.now ?? new Date();
  let passwordReferenceDate: Date | null = null;

  if (args.passwordChangedAt) {
    passwordReferenceDate = new Date(args.passwordChangedAt);
  } else if (args.fallbackDate) {
    passwordReferenceDate = new Date(args.fallbackDate);
  }

  if (!passwordReferenceDate || Number.isNaN(passwordReferenceDate.getTime())) {
    return false;
  }

  const expiresAt = new Date(passwordReferenceDate);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + args.policy.expiryDays);
  return expiresAt.getTime() <= now.getTime();
}
