"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSidebarProfile } from "../service/sidebar-profile.service";

export function useSidebarProfile() {
  return useQuery({
    queryKey: ["sidebar-profile"],
    queryFn: fetchSidebarProfile,
    staleTime: 60_000,
  });
}
