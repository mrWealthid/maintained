import { z } from "zod";

import { TECHNICIAN_SPECIALTY_VALUES } from "@/features/technicians/models/technician-specialty.model";

export const TradeSignupSchema = z
  .object({
    name: z.string().trim().min(1, "Your name is required").max(120),
    email: z.string().trim().email("Enter a valid email").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirm: z.string(),
    contact: z.string().trim().max(40).optional(),
    countryCode: z.string().trim().max(8).optional(),
    businessName: z
      .string()
      .trim()
      .min(2, "Business or trading name is required")
      .max(120),
    specialties: z
      .array(z.enum(TECHNICIAN_SPECIALTY_VALUES as [string, ...string[]]))
      .min(1, "Pick at least one specialty so workspaces can find you")
      .max(8, "Pick at most 8 specialties"),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export type TradeSignupValues = z.infer<typeof TradeSignupSchema>;
