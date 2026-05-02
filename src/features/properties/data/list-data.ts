import {
  PROPERTY_TYPE,
  PROPERTY_TYPE_LABELS,
  type PropertyType,
} from "../models/property-type.model";

export type PropertyTypeMeta = {
  label: string;
  className: string;
};

export const PROPERTY_TYPE_META: Record<PropertyType, PropertyTypeMeta> = {
  [PROPERTY_TYPE.HOUSE]: {
    label: PROPERTY_TYPE_LABELS[PROPERTY_TYPE.HOUSE],
    className: "border-status-resolved/40/40 bg-status-resolved text-status-resolved",
  },
  [PROPERTY_TYPE.BUILDING]: {
    label: PROPERTY_TYPE_LABELS[PROPERTY_TYPE.BUILDING],
    className: "border-status-progress/40/40 bg-status-progress text-status-progress",
  },
  [PROPERTY_TYPE.STATION]: {
    label: PROPERTY_TYPE_LABELS[PROPERTY_TYPE.STATION],
    className: "border-accent/40/40 bg-accent text-accent-foreground",
  },
};

export const PROPERTY_TYPE_FILTER_OPTIONS = (
  Object.keys(PROPERTY_TYPE_META) as PropertyType[]
).map((value) => ({
  value,
  label: PROPERTY_TYPE_META[value].label,
}));
