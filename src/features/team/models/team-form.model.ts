import { z } from "zod";

import { WORKSPACE_ASSIGNABLE_ROLE_VALUES } from "@/shared/auth/roles";

export const teamInviteFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  role: z.enum(
    WORKSPACE_ASSIGNABLE_ROLE_VALUES as unknown as [string, ...string[]],
    { required_error: "Role is required" },
  ),
});

export type TeamInviteFormValues = z.infer<typeof teamInviteFormSchema>;

export const teamRoleUpdateSchema = z.object({
  role: z.enum(
    WORKSPACE_ASSIGNABLE_ROLE_VALUES as unknown as [string, ...string[]],
  ),
});

export type TeamRoleUpdateValues = z.infer<typeof teamRoleUpdateSchema>;

export const teamListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  role: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type TeamListQuery = z.infer<typeof teamListQuerySchema>;
