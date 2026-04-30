export const PROPERTY_TYPE = {
  HOUSE: "HOUSE",
  BUILDING: "BUILDING",
  STATION: "STATION",
} as const;

export const PROPERTY_TYPE_VALUES = Object.values(PROPERTY_TYPE);

export type PropertyType = (typeof PROPERTY_TYPE_VALUES)[number];

export function isPropertyType(value: unknown): value is PropertyType {
  return (
    typeof value === "string" &&
    PROPERTY_TYPE_VALUES.includes(value as PropertyType)
  );
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PROPERTY_TYPE.HOUSE]: "House",
  [PROPERTY_TYPE.BUILDING]: "Building",
  [PROPERTY_TYPE.STATION]: "Station",
};
