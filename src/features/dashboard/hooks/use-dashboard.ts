"use client";

import { useQuery } from "@tanstack/react-query";
import { DASHBOARD_KEYS } from "../data/dashboard-data";
import { fetchDashboardChecklist } from "../services/dashboard-service";

export function useDashboardChecklist() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.all,
    queryFn: fetchDashboardChecklist,
  });
}
