"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiErrorHandler } from "@/utils/apiError";

import {
  createProperty,
  deleteProperty,
  fetchPropertyById,
  fetchPropertyList,
  updateProperty,
} from "../services/properties-service";
import type {
  PropertyFormValues,
  PropertyListQuery,
} from "../models/property-form.model";

export const PROPERTY_KEYS = {
  all: ["properties"] as const,
  list: (query: PropertyListQuery) => ["properties", "list", query] as const,
  byId: (id: string) => ["properties", id] as const,
} as const;

export function usePropertyList(query: PropertyListQuery) {
  return useQuery({
    queryKey: PROPERTY_KEYS.list(query),
    queryFn: () => fetchPropertyList(query),
    placeholderData: (previous) => previous,
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: id ? PROPERTY_KEYS.byId(id) : ["properties", "noop"],
    queryFn: () => fetchPropertyById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PropertyFormValues) => createProperty(payload),
    onSuccess: () => {
      toast.success("Property created");
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}

export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<PropertyFormValues>) =>
      updateProperty(id, payload),
    onSuccess: () => {
      toast.success("Property updated");
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      toast.success("Property deleted");
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}
