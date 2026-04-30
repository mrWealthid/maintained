import { z } from "zod";

import { TECHNICIAN_SPECIALTY_VALUES } from "./technician-specialty.model";

export const technicianInviteFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  specialties: z
    .array(z.enum(TECHNICIAN_SPECIALTY_VALUES as [string, ...string[]]))
    .min(1, "Select at least one specialty"),
});

export type TechnicianInviteFormValues = z.infer<
  typeof technicianInviteFormSchema
>;

export const technicianListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  specialty: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type TechnicianListQuery = z.infer<typeof technicianListQuerySchema>;
