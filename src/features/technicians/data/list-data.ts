import {
  TECHNICIAN_SPECIALTY,
  TECHNICIAN_SPECIALTY_LABELS,
  type TechnicianSpecialty,
} from "../models/technician-specialty.model";

export type TechnicianSpecialtyMeta = {
  label: string;
  className: string;
};

const TONE = {
  electric: "border-status-open/40/40 bg-status-open text-status-open",
  water: "border-status-progress/40/40 bg-status-progress text-status-progress",
  air: "border-status-progress/40/40 bg-status-progress text-status-progress",
  wood: "border-status-open/40/40 bg-status-open text-status-open",
  paint: "border-destructive/40/40 bg-destructive text-destructive",
  lock: "border-slate-500/40 bg-slate-50 text-slate-700",
  appliance: "border-accent/40/40 bg-accent text-accent-foreground",
  general: "border-status-resolved/40/40 bg-status-resolved text-status-resolved",
} as const;

export const TECHNICIAN_SPECIALTY_META: Record<
  TechnicianSpecialty,
  TechnicianSpecialtyMeta
> = {
  [TECHNICIAN_SPECIALTY.ELECTRICIAN]: {
    label: TECHNICIAN_SPECIALTY_LABELS[TECHNICIAN_SPECIALTY.ELECTRICIAN],
    className: TONE.electric,
  },
  [TECHNICIAN_SPECIALTY.PLUMBER]: {
    label: TECHNICIAN_SPECIALTY_LABELS[TECHNICIAN_SPECIALTY.PLUMBER],
    className: TONE.water,
  },
  [TECHNICIAN_SPECIALTY.HVAC]: {
    label: TECHNICIAN_SPECIALTY_LABELS[TECHNICIAN_SPECIALTY.HVAC],
    className: TONE.air,
  },
  [TECHNICIAN_SPECIALTY.CARPENTER]: {
    label: TECHNICIAN_SPECIALTY_LABELS[TECHNICIAN_SPECIALTY.CARPENTER],
    className: TONE.wood,
  },
  [TECHNICIAN_SPECIALTY.PAINTER]: {
    label: TECHNICIAN_SPECIALTY_LABELS[TECHNICIAN_SPECIALTY.PAINTER],
    className: TONE.paint,
  },
  [TECHNICIAN_SPECIALTY.LOCKSMITH]: {
    label: TECHNICIAN_SPECIALTY_LABELS[TECHNICIAN_SPECIALTY.LOCKSMITH],
    className: TONE.lock,
  },
  [TECHNICIAN_SPECIALTY.APPLIANCE_REPAIR]: {
    label: TECHNICIAN_SPECIALTY_LABELS[TECHNICIAN_SPECIALTY.APPLIANCE_REPAIR],
    className: TONE.appliance,
  },
  [TECHNICIAN_SPECIALTY.GENERAL_HANDYMAN]: {
    label: TECHNICIAN_SPECIALTY_LABELS[TECHNICIAN_SPECIALTY.GENERAL_HANDYMAN],
    className: TONE.general,
  },
};

export const TECHNICIAN_SPECIALTY_FILTER_OPTIONS = (
  Object.keys(TECHNICIAN_SPECIALTY_META) as TechnicianSpecialty[]
).map((value) => ({
  value,
  label: TECHNICIAN_SPECIALTY_META[value].label,
}));
