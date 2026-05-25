import { z } from "zod";

import { TICKET_PRIORITY_VALUES, type TicketPriority } from "./ticket-priority.model";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

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
  priority: z.enum(TICKET_PRIORITY_VALUES as [TicketPriority, ...TicketPriority[]], {
    required_error: "Priority is required",
  }),
  relatedTo: z.string().optional().nullable(),
  property: z.string().min(1, "Property is required"),
  unit: z.string().min(1, "Unit is required"),
  images: z.array(z.string().url()).default([]),
  videos: z.array(z.string().url()).default([]),
  documents: z.array(z.string().url()).default([]),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;

/**
 * Client-side form schema. Property/unit are optional for tenant-created
 * tickets because the API can resolve them from the verified user. Admin flows
 * make them required with react-hook-form rules when rendering those fields.
 * Attachment URLs are produced at submit time and live on the payload, not the
 * form.
 */
const ticketCreateBaseFormSchema = ticketFormSchema.omit({
  images: true,
  videos: true,
  documents: true,
  priority: true,
});

export const ticketCreateFormSchema = ticketCreateBaseFormSchema
  .extend({
    property: z.preprocess(
      emptyStringToUndefined,
      z.string().min(1, "Property is required").optional(),
    ),
    unit: z.preprocess(
      emptyStringToUndefined,
      z.string().min(1, "Unit is required").optional(),
    ),
  });

export const ticketAdminCreateFormSchema = ticketCreateBaseFormSchema
  .omit({
    relatedTo: true,
  })
  .extend({
    property: z.string().min(1, "Property is required"),
    unit: z.string().min(1, "Unit is required"),
    relatedTo: z.string().optional().nullable(),
  });

type ResolvedFormValues = z.infer<typeof ticketCreateFormSchema>;

export type TicketCreateFormValues = ResolvedFormValues & {
  images?: File[] | null;
  videos?: File[] | null;
  documents?: File[] | null;
};

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
