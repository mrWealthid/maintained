import { ROLES } from "@/shared/enums/enums";
import { CountryCode } from "libphonenumber-js";
import { z } from "zod";
import { AddressSchema } from "@/lib/validation/address";
import { isSupportedTimeZone } from "@/lib/date/timezone-options";
import { WORKSPACE_TYPE_VALUES } from "@/shared/model/workspace.model";
import { CODES, EmailRegex } from "../data/data";

export interface IUpdatePassword {
  newPassword: string;
  currentPassword?: string;
  confirmNewPassword?: string;
  resetToken: string;
}

export interface IResetPassword {
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type LoginForm = LoginPayload;

export interface AddressStructured {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode?: CountryCode;
  country: string;
  placeId?: string;
  lat?: number | null;
  lng?: number | null;
  raw?: Record<string, any>;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export const SignupSchema = z
  .object({
    workspaceType: z.enum(WORKSPACE_TYPE_VALUES, {
      required_error: "Choose the workspace type that fits your setup",
    }),
    // Personal/User fields
    name: z.string().min(3, "This field is required"),
    email: z.string().regex(EmailRegex, "Invalid email address"),
    contact: z.string().min(1, "This field is required"),
    countryCode: z.enum(CODES, { required_error: "Select a country" }),
    password: z.string().min(1, "Password is required"),
    // Workspace fields
    businessName: z.string().min(2, "Workspace name is required"),
    businessEmail: z
      .string()
      .regex(EmailRegex, "Invalid email address")
      .optional()
      .or(z.literal("")),
    businessContact: z.string().optional(),
    businessCountryCode: z
      .enum(CODES, { required_error: "Select a country" })
      .optional(),
    timezone: z
      .string()
      .refine(isSupportedTimeZone, "Select a valid timezone"),
    addressStructured: AddressSchema,
  })
  .strict();

export type SignupValues = z.infer<typeof SignupSchema>;

export interface IToken {
  id: string;
  role: ROLES;
  iat: number;
  exp: number;
}

export interface OnboardUser {
  inviteToken: string;
  password?: string;
  contact?: string;
  countryCode?: (typeof CODES)[number];
}

export interface OnboardUserForm {
  email: string;
  password: string;
  contact: string;
  countryCode: (typeof CODES)[number];
}

export interface PasswordlessLoginConfig {
  enabled: boolean;
}

export interface PasswordlessLoginRequestPayload {
  email: string;
  next?: string;
}

export interface InvitePreview {
  name: string;
  email: string;
  role: string;
  businessName: string;
  inviteExpiresAt: string | null;
  requiresAccountSetup: boolean;
}

export const OnboardUserSchema = z.object({
  inviteToken: z.string().min(1, "Invite token is required"),
  password: z.string().min(1, "Password is required").optional(),
  contact: z.string().min(1, "Phone number is required").optional(),
  countryCode: z.enum(CODES, { required_error: "Select a country" }).optional(),
});

export const OnboardUserFormSchema = z.object({
  email: z.string().regex(EmailRegex, "Invalid email address"),
  password: z.string().min(1, "Password is required"),
  contact: z.string().min(1, "Phone number is required"),
  countryCode: z.enum(CODES, { required_error: "Select a country" }),
});
