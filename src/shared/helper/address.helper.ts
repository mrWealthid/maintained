import {
  CA_PROVINCES,
  DE_STATES,
  NG_STATES,
  US_STATES,
} from "@/lib/validation/address";
import type {
  AddressFormData,
  ParsedAddress,
  SubdivisionOption,
} from "@/shared/model/address.model";

function safeTrim(v: string) {
  return (v ?? "").trim();
}

function getLocationCoordinate(
  coordinate: number | (() => number) | undefined
): number | null {
  if (typeof coordinate === "function") {
    return coordinate();
  }

  return typeof coordinate === "number" ? coordinate : null;
}

export function parseGooglePlace(
  details: google.maps.places.PlaceResult
): ParsedAddress {
  const comps = details.address_components ?? [];

  const findComp = (type: string) => comps.find((c) => c.types.includes(type));

  const getLong = (type: string) => safeTrim(findComp(type)?.long_name ?? "");
  const getShort = (type: string) =>
    safeTrim(findComp(type)?.short_name ?? "");

  const country = getLong("country") || "United States";
  const countryCode = (getShort("country") || "US").toUpperCase();

  const streetNumber = getLong("street_number");
  const route = getLong("route");
  const premise = getLong("premise");
  const subpremise = getLong("subpremise");
  const neighborhood = getLong("neighborhood");

  let line1 = [streetNumber, route].filter(Boolean).join(" ").trim();

  if (!line1) {
    line1 = [premise, neighborhood].filter(Boolean).join(", ").trim();
  }

  const city =
    getLong("locality") ||
    getLong("postal_town") ||
    getLong("sublocality") ||
    getLong("administrative_area_level_2") ||
    getLong("neighborhood") ||
    "";

  const state =
    getShort("administrative_area_level_1") ||
    getLong("administrative_area_level_1") ||
    "";

  const postal = getLong("postal_code");
  const postalSuffix = getLong("postal_code_suffix");
  const postalPrefix = getLong("postal_code_prefix");

  let postalCode = postal;
  if (countryCode === "US" && postal && postalSuffix) {
    postalCode = `${postal}-${postalSuffix}`;
  } else if (!postalCode && postalPrefix) {
    postalCode = postalPrefix;
  }

  const loc = details.geometry?.location;
  const lat = loc ? getLocationCoordinate(loc.lat) : null;
  const lng = loc ? getLocationCoordinate(loc.lng) : null;

  const line2 = subpremise || undefined;

  return {
    line1: line1 || details.formatted_address || "",
    line2,
    city,
    state,
    postalCode,
    country,
    countryCode,
    lat,
    lng,
    placeId: details.place_id ?? "",
    raw: details,
  };
}

export function getSubdivisionOptions(
  countryCode: string
): SubdivisionOption[] | null {
  if (countryCode === "US") {
    return US_STATES.map((state) => ({ value: state, label: state }));
  }
  if (countryCode === "CA") {
    return CA_PROVINCES.map((province) => ({
      value: province,
      label: province,
    }));
  }
  if (countryCode === "NG") {
    return NG_STATES.map((state) => ({ value: state, label: state }));
  }
  if (countryCode === "DE") {
    return DE_STATES.map((state) => ({ value: state, label: state }));
  }

  return null;
}

export function getSubdivisionLabel(countryCode: string): string {
  switch (countryCode) {
    case "GB":
      return "County / Region";
    case "CA":
      return "Province / Territory";
    default:
      return "State";
  }
}

export function getSubdivisionPlaceholder(countryCode: string): string {
  switch (countryCode) {
    case "CA":
      return "Select province / territory";
    default:
      return "Select state";
  }
}

export function getSubdivisionDescription(countryCode: string): string {
  switch (countryCode) {
    case "GB":
      return "Enter the county or region name";
    default:
      return "Select your state or province";
  }
}

export function getPostalCodePlaceholder(countryCode: string): string {
  switch (countryCode) {
    case "US":
      return "e.g., 10001 or 10001-1234";
    case "CA":
      return "e.g., M5H 2N2";
    case "GB":
      return "e.g., SW1A 1AA";
    case "DE":
      return "e.g., 10115";
    default:
      return "e.g., 100001";
  }
}

export function getPostalCodeDescription(countryCode: string): string {
  switch (countryCode) {
    case "US":
      return "Enter ZIP code (5 digits) or ZIP+4 format";
    case "CA":
      return "Enter postal code (A1A 1A1 format)";
    case "GB":
      return "Enter UK postcode";
    case "DE":
      return "Enter 5-digit postal code";
    default:
      return "Enter postal code";
  }
}

export function formatSingleLineAddress(a: AddressFormData | undefined): string {
  if (!a) return "";
  const cityStateZip = [a.city, a.state, a.postalCode]
    .filter(Boolean)
    .join(" ");
  return [a.line1, cityStateZip].filter(Boolean).join(", ");
}
