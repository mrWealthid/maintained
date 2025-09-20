import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreatePropertyPayload, CreateUnitPayload } from "../model/model";
import {
  fetchOnboardingChecklist,
  fetchProperties,
  fetchUnits,
  handleCreateProperty,
  handleCreateUnits,
} from "../service/onboarding-service";
import toast from "react-hot-toast";

export function useCreateProperty(isEditing: boolean, close?: () => void) {
  const queryClient = useQueryClient();
  const { isPending: isCreating, mutate: createProperty } = useMutation({
    mutationFn: (payload: CreatePropertyPayload) =>
      handleCreateProperty(payload),

    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      queryClient.invalidateQueries({ queryKey: ["Users"] });
      close?.();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { isCreating, createProperty };
}

export function useCreatePropertyUnit(isEditing: boolean, close?: () => void) {
  const queryClient = useQueryClient();
  const { isPending: isCreating, mutate: createUnit } = useMutation({
    mutationFn: (payload: CreateUnitPayload) => handleCreateUnits(payload),

    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      queryClient.invalidateQueries({ queryKey: ["Users"] });
      close?.();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { isCreating, createUnit };
}

export function useFetchProperties() {
  const { data, isFetching: isFetchingProperties } = useQuery({
    queryKey: ["properties"],
    queryFn: () => fetchProperties(),
  });
  return { data, isFetchingProperties };
}
export function useOnboardingChecklist() {
  const { data, isFetching: isFetchingChecklist } = useQuery({
    queryKey: ["checklist"],
    queryFn: () => fetchOnboardingChecklist(),
    staleTime: 0, // Always consider data stale, refetch on every mount
    refetchOnWindowFocus: true, // Refetch when user focuses the window
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnReconnect: true, // Refetch when network reconnects
  });
  return { data, isFetchingChecklist };
}

export function useUpdateUnitLabel(businessId?: string, propertyId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      unitId,
      label,
    }: {
      unitId: string;
      label: string;
    }) => {
      const res = await fetch(`/api/units/${unitId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units", businessId, propertyId] });
    },
  });
}

export function useDeleteUnit(businessId?: string, propertyId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ unitId }: { unitId: string }) => {
      const res = await fetch(`/api/units/${unitId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units", businessId, propertyId] });
    },
  });
}

export function useFetchUnits(propertyId: string) {
  const { data: units, isFetching: isFetchingUnits } = useQuery({
    queryKey: ["units", propertyId],
    queryFn: () => fetchUnits(propertyId),
  });
  return { units, isFetchingUnits };
}
