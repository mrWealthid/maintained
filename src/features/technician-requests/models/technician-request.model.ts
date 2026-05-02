import { z } from "zod";
import { TECHNICIAN_RESPONSE_VALUES } from "@/features/tickets/models/technician-response.model";

export const technicianRequestListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  title: z.string().optional(),
  status: z.string().optional(),
});

export const technicianRequestCreateSchema = z.object({
  technicianIds: z.array(z.string().min(1)).min(1),
  expiresAt: z.string().datetime().optional(),
});

export const technicianResponseSchema = z.object({
  status: z.enum(TECHNICIAN_RESPONSE_VALUES as [string, ...string[]]),
  quote: z
    .object({
      total: z.number().optional(),
      cost: z.array(z.object({ title: z.string(), amount: z.number() })),
      currency: z.string(),
    })
    .optional(),
  message: z.string().optional(),
  reason: z.string().optional(),
  schedule: z
    .object({
      date: z.string().or(z.date()),
      start: z.string(),
      end: z.string(),
      day: z.string(),
    })
    .optional(),
});

export type TechnicianRequestListQuery = z.infer<
  typeof technicianRequestListQuerySchema
>;
export type TechnicianRequestCreateValues = z.infer<
  typeof technicianRequestCreateSchema
>;
export type TechnicianResponseValues = z.infer<typeof technicianResponseSchema>;
