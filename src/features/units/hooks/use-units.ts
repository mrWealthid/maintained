"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiErrorHandler } from "@/utils/apiError";

import {
  createUnit,
  deleteUnit,
  fetchUnitById,
  fetchUnitList,
  updateUnit,
} from "../services/units-service";
import type {
  UnitFormValues,
  UnitListQuery,
} from "../models/unit-form.model";

export const UNIT_KEYS = {
  all: ["units"] as const,
  list: (query: UnitListQuery) => ["units", "list", query] as const,
  byId: (id: string) => ["units", id] as const,
} as const;

export function useUnitList(query: UnitListQuery) {
  return useQuery({
    queryKey: UNIT_KEYS.list(query),
    queryFn: () => fetchUnitList(query),
    placeholderData: (previous) => previous,
  });
}

export function useUnit(id: string | undefined) {
  return useQuery({
    queryKey: id ? UNIT_KEYS.byId(id) : ["units", "noop"],
    queryFn: () => fetchUnitById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UnitFormValues) => createUnit(payload),
    onSuccess: () => {
      toast.success("Unit created");
      queryClient.invalidateQueries({ queryKey: UNIT_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}

export function useUpdateUnit(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<UnitFormValues>) => updateUnit(id, payload),
    onSuccess: () => {
      toast.success("Unit updated");
      queryClient.invalidateQueries({ queryKey: UNIT_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: UNIT_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: () => {
      toast.success("Unit deleted");
      queryClient.invalidateQueries({ queryKey: UNIT_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}
