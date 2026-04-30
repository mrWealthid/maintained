export const TECHNICIAN_RESPONSE = {
  PENDING: "PENDING",
  APPLIED: "APPLIED",
  SELECTED: "SELECTED",
  DECLINED: "DECLINED",
  INSPECTION_REQUESTED: "INSPECTION_REQUESTED",
} as const;

export const TECHNICIAN_RESPONSE_VALUES = Object.values(TECHNICIAN_RESPONSE);

export type TechnicianResponse = (typeof TECHNICIAN_RESPONSE_VALUES)[number];

export function isTechnicianResponse(
  value: unknown,
): value is TechnicianResponse {
  return (
    typeof value === "string" &&
    TECHNICIAN_RESPONSE_VALUES.includes(value as TechnicianResponse)
  );
}
