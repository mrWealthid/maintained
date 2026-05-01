import type { DashboardRole } from "../models/dashboard.model";

export const DASHBOARD_ROLES: DashboardRole[] = ["admin", "technician", "user"];

export const DASHBOARD_KEYS = {
  all: ["dashboard"] as const,
  role: (role: DashboardRole) => ["dashboard", role] as const,
} as const;
