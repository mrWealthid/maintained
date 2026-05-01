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
    className: "border-emerald-500/40 bg-emerald-50 text-emerald-700",
  },
  [PROPERTY_TYPE.BUILDING]: {
    label: PROPERTY_TYPE_LABELS[PROPERTY_TYPE.BUILDING],
    className: "border-sky-500/40 bg-sky-50 text-sky-700",
  },
  [PROPERTY_TYPE.STATION]: {
    label: PROPERTY_TYPE_LABELS[PROPERTY_TYPE.STATION],
    className: "border-violet-500/40 bg-violet-50 text-violet-700",
  },
};

export const PROPERTY_TYPE_FILTER_OPTIONS = (
  Object.keys(PROPERTY_TYPE_META) as PropertyType[]
).map((value) => ({
  value,
  label: PROPERTY_TYPE_META[value].label,
}));
