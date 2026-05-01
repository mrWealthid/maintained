import z from "zod";

import { AddressSchema } from "@/lib/validation/address";
import { isSupportedTimeZone } from "@/lib/date/timezone-options";
import { CODES, EmailRegex } from "@/app/auth/data/data";
import { WORKSPACE_TYPE } from "@/shared/model/workspace.model";

export const CreateWorkspaceSchema = z
  .object({
    workspaceType: z.enum([WORKSPACE_TYPE.BUSINESS, WORKSPACE_TYPE.INDIVIDUAL], {
      required_error: "Choose the workspace type that fits your setup",
    }),
    businessName: z.string().min(2, "Workspace name is required"),
    businessEmail: z
      .string()
      .regex(EmailRegex, "Invalid email address")
      .optional()
      .or(z.literal("")),
    businessContact: z.string().optional().or(z.literal("")),
    businessCountryCode: z
      .enum([...CODES] as [typeof CODES[number], ...typeof CODES[number][]], {
        required_error: "Select a country",
      })
      .optional(),
    timezone: z
      .string()
      .refine(isSupportedTimeZone, "Select a valid timezone"),
    addressStructured: AddressSchema,
  })
  .strict();

export type CreateWorkspaceValues = z.infer<typeof CreateWorkspaceSchema>;
