import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUnit,
  deleteUnit,
  fetchUnitDetails,
  fetchUnitList,
  updateUnit,
} from "../service/unit-service";
import { Unit, UnitListFilter } from "../service/unit-service";
import { ApiError } from "next/dist/server/api-utils";

export function useCreateUnit(isEditing: boolean, unitId?: string) {
  const queryClient = useQueryClient();
  const { isPending: isCreating, mutate: handleCreateUnit } = useMutation({
    mutationFn: (payload: Partial<Unit>) =>
      isEditing && unitId ? updateUnit(unitId, payload) : createUnit(payload),
    onSuccess: () => {
      toast.success(
        `🎉 Unit successfully ${isEditing ? "updated" : "created"}`
      );
      queryClient.invalidateQueries({
        queryKey: ["units"],
      });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isCreating, handleCreateUnit };
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  const { isPending: isDeleting, mutate: handleDeleteUnit } = useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: () => {
      toast.success("🎉 Unit successfully deleted");
      queryClient.invalidateQueries({
        queryKey: ["units"],
      });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isDeleting, handleDeleteUnit };
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  const { isPending: isUpdating, mutate: handleUpdateUnit } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Unit> }) =>
      updateUnit(id, data),
    onSuccess: () => {
      toast.success("🎉 Unit successfully updated");
      queryClient.invalidateQueries({
        queryKey: ["units"],
      });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isUpdating, handleUpdateUnit };
}

export function useFetchUnitDetails(id: string) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["unitDetails", id],
    queryFn: () => fetchUnitDetails(id),
    enabled: !!id,
  });

  return {
    isLoading,
    error,
    isRefetching,
    ...data,
  };
}

export function useFetchUnits(
  search: UnitListFilter = {},
  page: number = 1,
  limit: number = 10
) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["units", search, page, limit],
    queryFn: () => fetchUnitList<Unit>({ page, limit, search }),
  });

  return {
    isLoading,
    error,
    isRefetching,
    ...data,
  };
}
