import { z } from "zod";

export const tenantInviteFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  property: z.string().min(1, "Property is required"),
  unit: z.string().min(1, "Unit is required"),
  accessibleUnits: z.array(z.string()).default([]),
});

export type TenantInviteFormValues = z.infer<typeof tenantInviteFormSchema>;

export const tenantListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  property: z.string().optional(),
  unit: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type TenantListQuery = z.infer<typeof tenantListQuerySchema>;

export type TenantListItem = {
  id: string;
  kind: "tenant" | "invite";
  name: string;
  email: string;
  status: "active" | "pending";
  property?: {
    _id?: string;
    id?: string;
    name?: string;
    type?: string;
  } | null;
  unit?: {
    _id?: string;
    id?: string;
    label?: string;
    floor?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    sizeSqft?: number | null;
    tenantActive?: boolean | null;
    monthlyRent?: {
      amount?: number | null;
      currency?: string | null;
    } | null;
  } | null;
  joinedAt?: string | null;
  invitedAt?: string | null;
  inviteExpiresAt?: string | null;
};

export type TenantListResponse = {
  status: string;
  data: TenantListItem[];
  totalRecords: number;
  results: number;
  summary: {
    total: number;
    active: number;
    pending: number;
  };
};
