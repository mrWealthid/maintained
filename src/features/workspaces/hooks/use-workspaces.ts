"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/shared/model/model";
import {
  runBulkWorkspaceAction,
  updateWorkspaceStatus,
} from "../services/workspace-admin.service";

export function useUpdateWorkspaceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateWorkspaceStatus(id, isActive),
    onSuccess: async (_data, variables) => {
      toast.success(
        variables.isActive
          ? "Workspace activated successfully"
          : "Workspace deactivated successfully",
      );
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useBulkWorkspaceAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runBulkWorkspaceAction,
    onSuccess: async (result) => {
      const {
        action,
        successCount,
        skippedCount = 0,
        failureCount = 0,
      } = result.data;
      const pastTenseLabel = action === "activate" ? "activated" : "deactivated";

      if (successCount > 0) {
        toast.success(
          `${successCount} workspace${successCount === 1 ? "" : "s"} ${pastTenseLabel}.`,
        );
      } else {
        toast.message("No workspaces were updated.");
      }

      if (skippedCount > 0) {
        toast.message(
          `${skippedCount} workspace${skippedCount === 1 ? "" : "s"} already matched that status.`,
        );
      }

      if (failureCount > 0) {
        toast.warning(
          `${failureCount} workspace${failureCount === 1 ? "" : "s"} could not be processed.`,
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
