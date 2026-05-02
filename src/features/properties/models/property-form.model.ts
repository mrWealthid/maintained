import { z } from "zod";

import { PROPERTY_TYPE_VALUES } from "./property-type.model";

export const propertyAddressSchema = z.object({
  line1: z.string().trim().min(1, "Address line 1 is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
  placeId: z.string().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

export const propertyFormSchema = z.object({
  type: z.enum(PROPERTY_TYPE_VALUES as [string, ...string[]], {
    required_error: "Property type is required",
  }),
  name: z.string().trim().min(1, "Property name is required").max(160),
  code: z.string().trim().max(40).optional(),
  address: propertyAddressSchema,
  isActive: z.boolean().default(true),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const propertyListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  name: z.string().optional(),
  type: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>;
