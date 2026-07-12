import { z } from "zod";

import { TECHNICIAN_SPECIALTY_VALUES } from "@/features/technicians/models/technician-specialty.model";

/**
 * PATCH /api/trades/me/profile — partial update of the calling trade's
 * profile. Every field is optional; only sent fields are applied. Empty
 * `specialties` arrays are rejected since the model invariant requires
 * at least one specialty.
 */
export const TradeProfileUpdateSchema = z
  .object({
    businessName: z.string().trim().min(2).max(120).optional(),
    contactPhone: z.string().trim().max(40).optional(),
    description: z.string().trim().max(2000).optional(),
    specialties: z
      .array(z.enum(TECHNICIAN_SPECIALTY_VALUES as [string, ...string[]]))
      .min(1, "Keep at least one specialty so workspaces can match you")
      .max(8, "Pick at most 8 specialties")
      .optional(),
    address: z.string().trim().max(280).optional(),
    serviceAreaKm: z.number().min(0).max(2000).optional(),
  })
  .strict();

export type TradeProfileUpdateInput = z.infer<typeof TradeProfileUpdateSchema>;
