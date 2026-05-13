import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreatePropertyPayload,
  CreateMultiplePropertiesPayload,
  CreateUnitPayload,
} from "../model/model";
import {
  completeOnboarding,
  fetchOnboardingState,
  fetchProperties,
  fetchUnits,
  handleCreateProperty,
  handleCreateMultipleProperties,
  handleCreateUnits,
} from "../service/onboarding-service";
import { toast } from "sonner";

export function useCreateProperty(isEditing: boolean, close?: () => void) {
  const queryClient = useQueryClient();
  const { isPending: isCreating, mutate: createProperty } = useMutation({
    mutationFn: (payload: CreatePropertyPayload) =>
      handleCreateProperty(payload),

    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["onboarding-state"] });
      queryClient.invalidateQueries({ queryKey: ["Users"] });
      close?.();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { isCreating, createProperty };
}

export function useCreateMultipleProperties(
  isEditing: boolean,
  close?: () => void
) {
  const queryClient = useQueryClient();
  const { isPending: isCreating, mutate: createMultipleProperties } =
    useMutation({
      mutationFn: (payload: CreateMultiplePropertiesPayload) =>
        handleCreateMultipleProperties(payload),

      onSuccess: (data) => {
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["properties"] });
        queryClient.invalidateQueries({ queryKey: ["onboarding-state"] });
        queryClient.invalidateQueries({ queryKey: ["Users"] });
        toast.success(`Successfully created ${data.count} properties`);
        close?.();
      },
      onError: (err: any) => toast.error(err.message),
    });

  return { isCreating, createMultipleProperties };
}

export function useCreatePropertyUnit(isEditing: boolean, close?: () => void) {
  const queryClient = useQueryClient();
  const { isPending: isCreating, mutate: createUnit } = useMutation({
    mutationFn: (payload: CreateUnitPayload) => handleCreateUnits(payload),

    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["onboarding-state"] });
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
export function useOnboardingState() {
  return useQuery({
    queryKey: ["onboarding-state"],
    queryFn: fetchOnboardingState,
    select: (response) => response.data,
    staleTime: 30_000,
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-state"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
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
    enabled: !!propertyId,
  });
  return { units, isFetchingUnits };
}
