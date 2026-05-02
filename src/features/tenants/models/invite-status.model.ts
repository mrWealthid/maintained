/**
 * Membership invite lifecycle. Mirrors `INVITE_STATUS` in
 * `src/shared/enums/enums.ts` but in the eventSphere object-map shape so
 * call sites can switch on the constant without nested ternaries and so
 * future additions only require updating this file.
 */

export const INVITE_STATUS = {
  INVITED: "INVITED",
  ACTIVATED: "ACTIVATED",
  DEACTIVATED: "DEACTIVATED",
  DECLINED: "DECLINED",
} as const;

export const INVITE_STATUS_VALUES = Object.values(INVITE_STATUS);

export type InviteStatus = (typeof INVITE_STATUS_VALUES)[number];

export function isInviteStatus(value: unknown): value is InviteStatus {
  return (
    typeof value === "string" &&
    INVITE_STATUS_VALUES.includes(value as InviteStatus)
  );
}
