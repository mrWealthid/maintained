export type SubdivisionOption = { value: string; label: string };

export type ParsedAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
  lat: number | null;
  lng: number | null;
  placeId: string;
  raw?: unknown;
};

export type AddressFormData = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  country?: string;
  lat?: number | null;
  lng?: number | null;
  placeId?: string;
  source?: "google" | "manual";
};
