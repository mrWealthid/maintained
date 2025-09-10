import { Types } from "mongoose";
import crypto from "crypto";
import { INVITE_STATUS, ROLES, TICKET_STATUS } from "@/app/shared/enums/enums";
import { Membership, User } from "@/app/shared/model/model";

export function mapToObject(map: Map<string, any>): { [key: string]: any } {
  const obj: { [key: string]: any } = {};
  for (let [key, value] of Array.from(map)) {
    // Checking if the value is a string representation of a number
    if (typeof value === "string" && !isNaN(Number(value))) {
      value = Number(value);
    }
    obj[key] = value;
  }
  return obj;
}

/**
 * Converts a File object to a Base64-encoded string.
 * @param file The File object to convert.
 * @returns A promise that resolves with the Base64-encoded string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // The result attribute contains the data as a base64-encoded string
      resolve(reader.result as string);

      console.log(reader.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    // Read the file as a data URL (base64-encoded string)
    reader.readAsDataURL(file);
  });
}

export default fileToBase64;

// --- Add this helper at the top or in a utils file ---
export function buildQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
}

/**
 * Gets the user's role for a specific business
 * @param memberships Array of user's memberships
 * @param businessId Target business ID to check against
 * @returns Role for the business, or undefined if not found
 */
export function getRoleForBusiness(
  memberships: Membership[],
  businessId: string | Types.ObjectId
): Membership["role"] | undefined {
  const targetId =
    typeof businessId === "string"
      ? new Types.ObjectId(businessId)
      : businessId;

  const membership = memberships.find((m) => {
    const businessId =
      typeof m.business === "string"
        ? new Types.ObjectId(m.business)
        : m.business;

    return businessId.toString() === targetId.toString();
  });

  return membership?.role;
}
export function getInviteStatusForBusiness(
  memberships: Membership[],
  businessId: string | Types.ObjectId
): Membership["status"] | undefined {
  const targetId =
    typeof businessId === "string"
      ? new Types.ObjectId(businessId)
      : businessId;

  const membership = memberships.find((m) => {
    const businessId =
      typeof m.business === "string"
        ? new Types.ObjectId(m.business)
        : m.business.id;

    return businessId.toString() === targetId.toString();
  });

  return membership?.status;
}

export function generateInviteToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, hashed, expires };
}

export function getMembershipForBusiness(
  user: User,
  businessId: string
): Membership | undefined {
  return user.memberships.find((m) => {
    const businessIdFromMembership =
      typeof m.business === "string" ? m.business : m.business.id;

    return businessIdFromMembership === businessId;
  });
}

export const getStatusColor = (status: TICKET_STATUS) => {
  switch (status) {
    case TICKET_STATUS.pending:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case TICKET_STATUS.pending_assignment:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case TICKET_STATUS.assigned:
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    case TICKET_STATUS.processing:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case TICKET_STATUS.scheduled:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case TICKET_STATUS.completed:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case TICKET_STATUS.declined:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export type ParsedAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat: number | null;
  lng: number | null;
  placeId: string;
  raw?: any;
};

export function parseGooglePlace(
  details: google.maps.places.PlaceResult
): ParsedAddress {
  const comps = details.address_components ?? [];
  const get = (type: string, short = false) =>
    comps.find((c) => c.types.includes(type))?.[
      short ? "short_name" : "long_name"
    ] ?? "";

  const line1 = [get("street_number"), get("route")]
    .filter(Boolean)
    .join(" ")
    .trim();
  const city =
    get("locality") ||
    get("sublocality") ||
    get("postal_town") ||
    get("administrative_area_level_2");
  const state = get("administrative_area_level_1", true);
  const postalCode = get("postal_code");
  const country = get("country") || "United States";
  const loc = details.geometry?.location;
  const lat = loc
    ? typeof loc.lat === "function"
      ? loc.lat()
      : (loc as any).lat
    : null;
  const lng = loc
    ? typeof loc.lng === "function"
      ? loc.lng()
      : (loc as any).lng
    : null;

  return {
    line1,
    city,
    state,
    postalCode,
    country,
    lat,
    lng,
    placeId: details.place_id ?? "",
    raw: details,
  };
}
