import type { ChartConfig } from "@/components/ui/chart";

export const DASHBOARD_CHART_CONFIG = {
  created: { label: "Created", color: "#2563eb" },
  completed: { label: "Completed", color: "#16a34a" },
  total: { label: "Total", color: "#2563eb" },
  open: { label: "Open", color: "#f59e0b" },
  highPriority: { label: "High Priority", color: "#dc2626" },
  value: { label: "Tickets", color: "#2563eb" },
} satisfies ChartConfig;

export const DASHBOARD_STATUS_COLORS = [
  "#f59e0b",
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#0d9488",
  "#16a34a",
  "#64748b",
] as const;

export const DASHBOARD_PRIORITY_COLORS = [
  "#dc2626",
  "#f59e0b",
  "#16a34a",
] as const;
