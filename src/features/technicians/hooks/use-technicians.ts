"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiErrorHandler } from "@/utils/apiError";

import {
  fetchTechnicianById,
  fetchTechnicianList,
  inviteTechnician,
  removeTechnician,
  updateTechnician,
} from "../services/technicians-service";
import type {
  TechnicianInviteFormValues,
  TechnicianListQuery,
} from "../models/technician-form.model";

export const TECHNICIAN_KEYS = {
  all: ["technicians"] as const,
  list: (query: TechnicianListQuery) =>
    ["technicians", "list", query] as const,
  byId: (id: string) => ["technicians", id] as const,
} as const;

export function useTechnicianList(query: TechnicianListQuery) {
  return useQuery({
    queryKey: TECHNICIAN_KEYS.list(query),
    queryFn: () => fetchTechnicianList(query),
    placeholderData: (previous) => previous,
  });
}

export function useTechnician(id: string | undefined) {
  return useQuery({
    queryKey: id ? TECHNICIAN_KEYS.byId(id) : ["technicians", "noop"],
    queryFn: () => fetchTechnicianById(id as string),
    enabled: Boolean(id),
  });
}

export function useInviteTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TechnicianInviteFormValues) =>
      inviteTechnician(payload),
    onSuccess: () => {
      toast.success("Technician invitation sent");
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.extract(err).message),
  });
}

export function useUpdateTechnician(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<TechnicianInviteFormValues>) =>
      updateTechnician(id, payload),
    onSuccess: () => {
      toast.success("Technician updated");
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.extract(err).message),
  });
}

export function useRemoveTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeTechnician(id),
    onSuccess: () => {
      toast.success("Technician removed");
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.extract(err).message),
  });
}
