"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiErrorHandler } from "@/utils/apiError";

import {
  fetchTenantById,
  fetchTenantList,
  inviteTenant,
  removeTenant,
  updateTenant,
} from "../services/tenants-service";
import type {
  TenantInviteFormValues,
  TenantListQuery,
} from "../models/tenant-form.model";

export const TENANT_KEYS = {
  all: ["tenants"] as const,
  list: (query: TenantListQuery) => ["tenants", "list", query] as const,
  byId: (id: string) => ["tenants", id] as const,
} as const;

export function useTenantList(query: TenantListQuery) {
  return useQuery({
    queryKey: TENANT_KEYS.list(query),
    queryFn: () => fetchTenantList(query),
    placeholderData: (previous) => previous,
  });
}

export function useTenant(id: string | undefined) {
  return useQuery({
    queryKey: id ? TENANT_KEYS.byId(id) : ["tenants", "noop"],
    queryFn: () => fetchTenantById(id as string),
    enabled: Boolean(id),
  });
}

export function useInviteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TenantInviteFormValues) => inviteTenant(payload),
    onSuccess: () => {
      toast.success("Tenant invitation sent");
      queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.extract(err).message),
  });
}

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<TenantInviteFormValues>) =>
      updateTenant(id, payload),
    onSuccess: () => {
      toast.success("Tenant updated");
      queryClient.invalidateQueries({ queryKey: TENANT_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.extract(err).message),
  });
}

export function useRemoveTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeTenant(id),
    onSuccess: () => {
      toast.success("Tenant removed");
      queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.extract(err).message),
  });
}
