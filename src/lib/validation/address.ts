import { z } from "zod";

export const COUNTRY_OPTIONS = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "NG", name: "Nigeria" },
  { code: "DE", name: "Germany" },
] as const;

export const COUNTRY_CODES = COUNTRY_OPTIONS.map((c) => c.code) as [
  "US",
  "CA",
  "GB",
  "NG",
  "DE",
];

export const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
] as const;

export const CA_PROVINCES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
] as const;

// For NG / DE you may use full names OR codes.
// To avoid “what is the official code?” ambiguity, store the subdivision as a string.
// If you prefer strict enums, I can provide full lists.
export const NG_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
] as const;

export const DE_STATES = [
  "Baden-Württemberg",
  "Bavaria",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hesse",
  "Lower Saxony",
  "Mecklenburg-Vorpommern",
  "North Rhine-Westphalia",
  "Rhineland-Palatinate",
  "Saarland",
  "Saxony",
  "Saxony-Anhalt",
  "Schleswig-Holstein",
  "Thuringia",
] as const;

export const usZipRegex = /^(?:\d{5})(?:-\d{4})?$/;
export const caPostalRegex =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
export const gbPostcodeRegex =
  /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
export const dePostalRegex = /^\d{5}$/;
// Nigeria postcodes exist but are not consistently used by users; allow 6 digits if provided.
export const ngPostalRegex = /^\d{6}$/;

export function countryNameFromCode(code: string) {
  return COUNTRY_OPTIONS.find((c) => c.code === code)?.name ?? code;
}

export const AddressSchema = z
  .object({
    // Stable shape for UI
    source: z.enum(["google", "manual"]),

    line1: z.string().min(3, "Address line 1 is required"),
    line2: z.string(),

    city: z.string().min(2, "City is required"),

    countryCode: z.enum(COUNTRY_CODES, {
      required_error: "Country is required",
    }),
    country: z.string().min(2, "Country is required"),

    state: z.string().min(1, "State/Province/Region is required"),
    postalCode: z.string().min(1, "Postal code is required"),

    // Stable: always present, nullable
    lat: z.number().nullable(),
    lng: z.number().nullable(),

    // Stable: always present string
    placeId: z.string(),

    //   // GeoJSON Point (for $near, etc.)
    //   location: z
    //     .object({
    //       type: z.literal("Point").optional(),
    //       coordinates: z.tuple([z.number(), z.number()]).optional(), // [lng, lat]
    //     })
    //     .optional(),
    //   raw: z.record(z.string(), z.unknown()).optional(),
    // })
    location: z.object({}).passthrough().optional(),
    raw: z.record(z.string(), z.unknown()).optional(),
  })
  .required({
    source: true,
    countryCode: true,
    line2: true,
    lat: true,
    lng: true,
    placeId: true,
  })
  .superRefine((val, ctx) => {
    // Google selection requires placeId
    if (val.source === "google" && val.placeId.trim().length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["placeId"],
        message: "Missing Place Id",
      });
    }

    // Country must match code
    const expectedName = countryNameFromCode(val.countryCode);
    if (val.country !== expectedName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["country"],
        message: `Country must match selected country (${expectedName})`,
      });
    }

    // Subdivision validation
    if (
      val.countryCode === "US" &&
      !US_STATES.includes(val.state as (typeof US_STATES)[number])
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["state"],
        message: "Select a valid U.S. state",
      });
    }
    if (
      val.countryCode === "CA" &&
      !CA_PROVINCES.includes(val.state as (typeof CA_PROVINCES)[number])
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["state"],
        message: "Select a valid Canadian province/territory",
      });
    }
    if (
      val.countryCode === "NG" &&
      !NG_STATES.includes(val.state as (typeof NG_STATES)[number])
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["state"],
        message: "Select a valid Nigerian state",
      });
    }
    if (
      val.countryCode === "DE" &&
      !DE_STATES.includes(val.state as (typeof DE_STATES)[number])
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["state"],
        message: "Select a valid German state",
      });
    }
    // GB remains free text

    // Postal validation
    const p = val.postalCode.trim();
    if (val.countryCode === "US" && !usZipRegex.test(p)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["postalCode"],
        message: "Enter a valid ZIP or ZIP+4",
      });
    }
    if (val.countryCode === "CA" && !caPostalRegex.test(p)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["postalCode"],
        message: "Enter a valid Canadian postal code",
      });
    }
    if (val.countryCode === "GB" && !gbPostcodeRegex.test(p)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["postalCode"],
        message: "Enter a valid UK postcode",
      });
    }
    if (val.countryCode === "DE" && !dePostalRegex.test(p)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["postalCode"],
        message: "Enter a valid German postal code (5 digits)",
      });
    }
    if (val.countryCode === "NG" && !ngPostalRegex.test(p)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["postalCode"],
        message: "Enter a valid Nigerian postcode (6 digits)",
      });
    }

    // lat/lng pairing
    const hasLat = typeof val.lat === "number" && !Number.isNaN(val.lat);
    const hasLng = typeof val.lng === "number" && !Number.isNaN(val.lng);
    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: hasLat ? ["lng"] : ["lat"],
        message: "Provide both latitude and longitude, or leave both empty",
      });
    }
  });

export type AddressFormValues = z.infer<typeof AddressSchema>;

export const makeEmptyAddress = (
  cc: AddressFormValues["countryCode"] = "US",
): AddressFormValues => ({
  source: "manual",
  line1: "123 Main St",
  line2: "",
  city: "Raleigh",
  state: "NC",
  postalCode: "27606",
  countryCode: cc,
  country: countryNameFromCode(cc),
  lat: null,
  lng: null,
  placeId: "",
});
