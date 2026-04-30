export const TECHNICIAN_SPECIALTY = {
  ELECTRICIAN: "ELECTRICIAN",
  PLUMBER: "PLUMBER",
  HVAC: "HVAC",
  CARPENTER: "CARPENTER",
  PAINTER: "PAINTER",
  LOCKSMITH: "LOCKSMITH",
  APPLIANCE_REPAIR: "APPLIANCE_REPAIR",
  GENERAL_HANDYMAN: "GENERAL_HANDYMAN",
} as const;

export const TECHNICIAN_SPECIALTY_VALUES = Object.values(TECHNICIAN_SPECIALTY);

export type TechnicianSpecialty =
  (typeof TECHNICIAN_SPECIALTY_VALUES)[number];

export function isTechnicianSpecialty(
  value: unknown,
): value is TechnicianSpecialty {
  return (
    typeof value === "string" &&
    TECHNICIAN_SPECIALTY_VALUES.includes(value as TechnicianSpecialty)
  );
}

export const TECHNICIAN_SPECIALTY_LABELS: Record<TechnicianSpecialty, string> =
  {
    [TECHNICIAN_SPECIALTY.ELECTRICIAN]: "Electrician",
    [TECHNICIAN_SPECIALTY.PLUMBER]: "Plumber",
    [TECHNICIAN_SPECIALTY.HVAC]: "HVAC",
    [TECHNICIAN_SPECIALTY.CARPENTER]: "Carpenter",
    [TECHNICIAN_SPECIALTY.PAINTER]: "Painter",
    [TECHNICIAN_SPECIALTY.LOCKSMITH]: "Locksmith",
    [TECHNICIAN_SPECIALTY.APPLIANCE_REPAIR]: "Appliance repair",
    [TECHNICIAN_SPECIALTY.GENERAL_HANDYMAN]: "General handyman",
  };
