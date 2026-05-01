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
  electric: "border-amber-500/40 bg-amber-50 text-amber-700",
  water: "border-sky-500/40 bg-sky-50 text-sky-700",
  air: "border-indigo-500/40 bg-indigo-50 text-indigo-700",
  wood: "border-orange-500/40 bg-orange-50 text-orange-700",
  paint: "border-rose-500/40 bg-rose-50 text-rose-700",
  lock: "border-slate-500/40 bg-slate-50 text-slate-700",
  appliance: "border-violet-500/40 bg-violet-50 text-violet-700",
  general: "border-emerald-500/40 bg-emerald-50 text-emerald-700",
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
