"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApiError } from "@/shared/model/model";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";
import {
  createWorkspace,
  switchWorkspace,
  upgradeCurrentWorkspace,
} from "@/shared/services/workspace.service";
import type { CreateWorkspaceValues } from "@/shared/model/workspace-create.model";

function finalizeWorkspaceContextChange(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.clear();
  window.location.assign(APP_ROUTE_PATHS.DASHBOARD.OVERVIEW);
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateWorkspaceValues) =>
      createWorkspace(payload),
    onSuccess: async () => {
      finalizeWorkspaceContextChange(queryClient);
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useSwitchWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessId: string) => switchWorkspace(businessId),
    onSuccess: async () => {
      finalizeWorkspaceContextChange(queryClient);
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpgradeWorkspace() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => upgradeCurrentWorkspace(),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sidebar-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["business-settings"] }),
        queryClient.invalidateQueries({ queryKey: ["me"] }),
      ]);
      toast.success(
        result.message ?? "Workspace upgraded to a business workspace.",
      );
      router.refresh();
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
