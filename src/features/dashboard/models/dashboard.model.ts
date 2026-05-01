export type DashboardRole = "admin" | "technician" | "user";

export type DashboardMetric = {
  id: string;
  label: string;
  value: number | string;
  delta?: number;
};

export type DashboardListQuery = {
  page?: number;
  limit?: number;
  search?: string;
};
