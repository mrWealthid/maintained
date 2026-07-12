import { z } from "zod";

import { TECHNICIAN_SPECIALTY_VALUES } from "@/features/technicians/models/technician-specialty.model";

/**
 * POST /api/tickets/[slug]/broadcast — body shape.
 * At least one of `specialty` (broadcast) or `invitedTradespeopleSlugs`
 * (shortlist) must be present. Both can be set: the request goes only to
 * the shortlisted trades, and `specialty` is preserved for filtering UI.
 */
export const RepairRequestBroadcastSchema = z
  .object({
    specialty: z
      .enum(TECHNICIAN_SPECIALTY_VALUES as [string, ...string[]])
      .optional(),
    invitedTradespeopleSlugs: z
      .array(z.string().trim().min(1))
      .max(50)
      .optional()
      .default([]),
    scopeNotes: z.string().trim().max(2000).optional(),
    /** ISO date string for when this broadcast stops accepting quotes. */
    expiresAt: z
      .string()
      .datetime({ message: "expiresAt must be a valid ISO datetime" })
      .optional(),
    /**
     * Whether to snapshot the ticket's AI `technicianDiagnosis` onto this
     * broadcast. Defaults to `true` so the historical behaviour is preserved
     * — admins can opt out per-request when the diagnosis is too sensitive,
     * speculative, or simply not relevant to share with trades.
     */
    includeDiagnosis: z.boolean().optional().default(true),
  })
  .refine(
    (v) => Boolean(v.specialty) || (v.invitedTradespeopleSlugs?.length ?? 0) > 0,
    {
      message:
        "Provide a specialty (broadcast) or invitedTradespeopleSlugs (shortlist).",
      path: ["specialty"],
    },
  );

export type RepairRequestBroadcastInput = z.infer<
  typeof RepairRequestBroadcastSchema
>;
