import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const AUTH_COOKIE_NAME = IS_PRODUCTION ? "__Host-session" : "session";
export const LEGACY_AUTH_COOKIE_NAMES = ["token", "__Host-token"].filter(
  (name) => name !== AUTH_COOKIE_NAME
);

type AuthCookieOptions = Pick<
  ResponseCookie,
  "httpOnly" | "secure" | "sameSite" | "path" | "expires"
>;

export function getAuthCookieOptions(expires: Date): AuthCookieOptions {
  return {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    expires,
  };
}

export function getClearedAuthCookieOptions(): AuthCookieOptions {
  return {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  };
}
