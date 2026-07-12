import { z } from "zod";

const LineItemSchema = z.object({
  label: z.string().trim().min(1, "Line item label is required").max(200),
  amountCents: z.number().int().min(0),
  quantity: z.number().int().min(1).max(1000).default(1),
});

/**
 * POST /api/trades/me/quotes — submit a new quote against an open RepairRequest.
 * Either provide lineItems (preferred; server computes total) or amountCents
 * alone (lump sum). At least one must be present.
 */
export const RepairQuoteSubmitSchema = z
  .object({
    repairRequestId: z.string().min(1, "repairRequestId is required"),
    amountCents: z.number().int().min(0).optional(),
    currency: z.string().trim().min(3).max(3).default("USD"),
    lineItems: z.array(LineItemSchema).max(50).default([]),
    scheduleProposal: z
      .object({
        earliestStart: z.string().datetime().optional(),
        durationHours: z.number().min(0).max(24 * 90).optional(),
      })
      .optional(),
    terms: z.string().trim().max(4000).optional(),
    warrantyDays: z.number().int().min(0).max(365 * 10).optional(),
    expiresAt: z.string().datetime().optional(),
  })
  .refine(
    (v) => (v.lineItems?.length ?? 0) > 0 || typeof v.amountCents === "number",
    {
      message: "Provide line items or a lump-sum amountCents.",
      path: ["lineItems"],
    },
  );

export type RepairQuoteSubmitInput = z.infer<typeof RepairQuoteSubmitSchema>;
