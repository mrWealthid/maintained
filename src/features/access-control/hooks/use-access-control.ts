"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/shared/model/model";
import {
  archiveWorkspaceRole,
  createWorkspaceRole,
  fetchWorkspaceRoles,
  updateWorkspaceRole,
} from "../services/access-control.service";

export function useWorkspaceRoles() {
  return useQuery({
    queryKey: ["team-roles"],
    queryFn: fetchWorkspaceRoles,
  });
}

export function useCreateWorkspaceRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorkspaceRole,
    onSuccess: async (result) => {
      toast.success(result.message || "Workspace role created");
      await qc.invalidateQueries({ queryKey: ["team-roles"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useUpdateWorkspaceRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateWorkspaceRole>[1];
    }) => updateWorkspaceRole(id, payload),
    onSuccess: async (result) => {
      toast.success(result.message || "Workspace role updated");
      await qc.invalidateQueries({ queryKey: ["team-roles"] });
      await qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useArchiveWorkspaceRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveWorkspaceRole,
    onSuccess: async (result) => {
      toast.success(result.message || "Workspace role archived");
      await qc.invalidateQueries({ queryKey: ["team-roles"] });
      await qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
