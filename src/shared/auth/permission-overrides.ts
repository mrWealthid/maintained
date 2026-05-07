export const PERMISSION_OVERRIDE_EFFECT = {
  allow: "ALLOW",
  deny: "DENY",
} as const;

export type PermissionOverrideEffect =
  (typeof PERMISSION_OVERRIDE_EFFECT)[keyof typeof PERMISSION_OVERRIDE_EFFECT];

export const PERMISSION_OVERRIDE_EFFECT_VALUES = Object.values(
  PERMISSION_OVERRIDE_EFFECT,
);
