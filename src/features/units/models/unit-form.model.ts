import { z } from "zod";

export const unitFormSchema = z.object({
  property: z.string().min(1, "Property is required"),
  propertyId: z.string().min(1, "Property is required").optional(),
  label: z.string().trim().min(1, "Label is required").max(60),
  floor: z.string().trim().max(20).optional(),
  isActive: z.boolean().default(true),
  tags: z.array(z.string().trim()).default([]),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;

export const unitListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  property: z.string().optional(),
  propertyId: z.string().optional(),
  label: z.string().optional(),
  tenant: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type UnitListQuery = z.infer<typeof unitListQuerySchema>;
