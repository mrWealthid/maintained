import { z } from "zod";

const passwordPolicySchema = z.object({
  minLength: z.number().int().min(6).max(64),
  expiryDays: z.number().int().min(0).max(365),
  requireUppercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecial: z.boolean(),
});

export const appSecuritySchema = z.object({
  require2fa: z.boolean(),
  enableSSO: z.boolean(),
  passwordlessLogin: z.boolean(),
  passwordPolicy: passwordPolicySchema,
});

export const appSettingsSchema = z.object({
  settings: z.object({
    security: appSecuritySchema,
  }),
});

export type AppSettingsFormValues = z.infer<typeof appSettingsSchema>;
export type AppSecurityFormValues = z.infer<typeof appSecuritySchema>;
