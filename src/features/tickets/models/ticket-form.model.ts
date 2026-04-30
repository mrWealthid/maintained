import { z } from "zod";

import { TICKET_PRIORITY_VALUES } from "./ticket-priority.model";

/**
 * Zod schema for the ticket create / edit form. Use with `react-hook-form`
 * via `zodResolver`. Mirrors the API expectations in
 * `src/app/api/tickets/route.ts` minus server-only fields.
 */

export const ticketFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  area: z.string().trim().min(1, "Area is required").max(120),
  description: z.string().trim().min(1, "Description is required").max(5000),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Type is required"),
  priority: z.enum(TICKET_PRIORITY_VALUES as [string, ...string[]], {
    required_error: "Priority is required",
  }),
  property: z.string().min(1, "Property is required"),
  unit: z.string().min(1, "Unit is required"),
  images: z.array(z.string().url()).default([]),
  videos: z.array(z.string().url()).default([]),
  documents: z.array(z.string().url()).default([]),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;

export const ticketListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.string().optional(),
  priority: z.string().optional(),
  property: z.string().optional(),
  unit: z.string().optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
});

export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;
