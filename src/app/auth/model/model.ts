import { ROLES } from "@/shared/enums/enums";
import { CountryCode } from "libphonenumber-js";

export interface IUpdatePassword {
  newPassword: string;
  currentPassword: string;
  confirmNewPassword: string;
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

export interface RegisterForm extends Omit<RegisterPayload, "name"> {
  firstName: string;
  lastName: string;
}

export interface AddressStructured {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode?: CountryCode;
  country: string;
  placeId?: string; // Google Place ID
  lat?: number | null;
  lng?: number | null;
  raw?: Record<string, any>; // optional: full Place Details payload
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}
export interface RegisterPayload {
  // user
  name: string;
  email: string;
  password: string;

  // business (existing)
  businessName: string;
  registrationId: string;
  businessContact: string;
  country: string; // keep for back-compat (will be "United States")
  businessAddress: string; // single-line, human readable
  businessEmail: string;
  countryCode: CountryCode;

  // NEW — fully structured address (recommended to send)
  addressStructured?: AddressStructured;

  //   // NEW — optional geospatial point (use if lat/lng available)
  location?: GeoPoint;

  //   // NEW — convenience duplicates if your backend expects flat fields
  //   addressPlaceId?: string;
  //   addressLat?: number | null;
  //   addressLng?: number | null;
}

export interface IToken {
  id: string;
  role: ROLES;
  iat: number;
  exp: number;
}

export interface OnboardUser {
  password: string;
  inviteToken: string;
}

export interface OnboardUserForm {
  password: string;
  dateOfBirth: string;
}
// password, inviteToken;
