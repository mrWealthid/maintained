import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProperty,
  deleteProperty,
  fetchPropertyDetails,
  fetchPropertyList,
  updateProperty,
} from "../service/property-service";
import { Property, PropertyListFilter } from "../service/property-service";
import { ApiError } from "next/dist/server/api-utils";

export function useCreateProperty(isEditing: boolean, propertyId?: string) {
  const queryClient = useQueryClient();
  const { isPending: isCreating, mutate: handleCreateProperty } = useMutation({
    mutationFn: (payload: Partial<Property>) =>
      isEditing && propertyId
        ? updateProperty(propertyId, payload)
        : createProperty(payload),
    onSuccess: () => {
      toast.success(
        `🎉 Property successfully ${isEditing ? "updated" : "created"}`
      );
      queryClient.invalidateQueries({
        queryKey: ["properties"],
      });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isCreating, handleCreateProperty };
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  const { isPending: isDeleting, mutate: handleDeleteProperty } = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      toast.success("🎉 Property successfully deleted");
      queryClient.invalidateQueries({
        queryKey: ["properties"],
      });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isDeleting, handleDeleteProperty };
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  const { isPending: isUpdating, mutate: handleUpdateProperty } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
      updateProperty(id, data),
    onSuccess: () => {
      toast.success("🎉 Property successfully updated");
      queryClient.invalidateQueries({
        queryKey: ["properties"],
      });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isUpdating, handleUpdateProperty };
}

export function useFetchPropertyDetails(id: string) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["propertyDetails", id],
    queryFn: () => fetchPropertyDetails(id),
    enabled: !!id,
  });

  return {
    isLoading,
    error,
    isRefetching,
    ...data,
  };
}

export function useFetchProperties(
  search: PropertyListFilter = {},
  page: number = 1,
  limit: number = 10
) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["properties", search, page, limit],
    queryFn: () => fetchPropertyList<Property>({ page, limit, search }),
  });

  return {
    isLoading,
    error,
    isRefetching,
    data,
  };
}
