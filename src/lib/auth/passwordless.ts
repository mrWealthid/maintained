import { createHash } from "crypto";

export const PASSWORDLESS_LOGIN_QUERY_PARAM = {
  STATUS: "passwordless",
  NEXT: "next",
  TOKEN: "token",
} as const;

export const PASSWORDLESS_LOGIN_STATUS = {
  DISABLED: "disabled",
  INVALID_LINK: "invalid_link",
  IP_BLOCKED: "ip_blocked",
  PASSWORD_EXPIRED: "password_expired",
  REVOKED: "revoked",
} as const;

const DEFAULT_PASSWORDLESS_REDIRECT_PATH = "/dashboard";
const DEFAULT_PASSWORDLESS_LOGIN_PATH = "/auth/login";

export function hashPasswordlessLoginToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getSafePasswordlessNextPath(nextPath?: string | null) {
  if (nextPath?.startsWith("/")) {
    return nextPath;
  }
  return DEFAULT_PASSWORDLESS_REDIRECT_PATH;
}

export function buildPasswordlessLoginRedirectPath(
  status: (typeof PASSWORDLESS_LOGIN_STATUS)[keyof typeof PASSWORDLESS_LOGIN_STATUS],
) {
  return `${DEFAULT_PASSWORDLESS_LOGIN_PATH}?${PASSWORDLESS_LOGIN_QUERY_PARAM.STATUS}=${status}`;
}
