import { Types } from "mongoose";
import crypto from "crypto";
import { INVITE_STATUS, ROLES, TICKET_STATUS } from "@/shared/enums/enums";
import { Membership, User } from "@/shared/model/model";

export function mapToObject(
  map: Map<string, any> | URLSearchParams
): { [key: string]: any } {
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
  if (!user) return;
  return user.memberships.find((m) => {
    const businessIdFromMembership =
      typeof m.business === "string" ? m.business : m.business.id;

    return businessIdFromMembership === businessId;
  });
}

export const getStatusColor = (status: TICKET_STATUS) => {
  switch (status) {
    case TICKET_STATUS.pending:
    case TICKET_STATUS.pending_assignment:
      return "bg-status-open text-status-open-foreground";
    case TICKET_STATUS.assigned:
    case TICKET_STATUS.processing:
    case TICKET_STATUS.scheduled:
      return "bg-status-progress text-status-progress-foreground";
    case TICKET_STATUS.completed:
      return "bg-status-resolved text-status-resolved-foreground";
    case TICKET_STATUS.declined:
      return "bg-status-overdue text-status-overdue-foreground";

    default:
      return "bg-muted text-muted-foreground";
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
  let lat = null;
  let lng = null;
  if (loc) {
    lat = typeof loc.lat === "function" ? loc.lat() : (loc as any).lat;
    lng = typeof loc.lng === "function" ? loc.lng() : (loc as any).lng;
  }

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
