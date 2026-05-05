"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/shared/model/model";
import {
  deactivateTeamMember,
  deleteTeamMember,
  fetchTeamOverview,
  inviteWorkspaceTeamMember,
  resendTeamInvite,
  runBulkTeamAction,
  updateTeamRole,
} from "../services/team-service";

export function useTeamOverview() {
  return useQuery({
    queryKey: ["team-overview"],
    queryFn: () => fetchTeamOverview(),
  });
}

export function useInviteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inviteWorkspaceTeamMember,
    onSuccess: async (result) => {
      toast.success(result.message || "Team invite sent");
      await qc.invalidateQueries({ queryKey: ["team"] });
      await qc.invalidateQueries({ queryKey: ["team-overview"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useUpdateTeamRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateTeamRole>[1];
    }) => updateTeamRole(id, payload),
    onSuccess: async (result) => {
      toast.success(result.message || "Role updated");
      await qc.invalidateQueries({ queryKey: ["team"] });
      await qc.invalidateQueries({ queryKey: ["team-overview"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useDeactivateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateTeamMember(id),
    onSuccess: async (result) => {
      toast.success(result.message || "Team member deactivated");
      await qc.invalidateQueries({ queryKey: ["team"] });
      await qc.invalidateQueries({ queryKey: ["team-overview"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useResendTeamInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resendTeamInvite(id),
    onSuccess: async (result) => {
      toast.success(result.message || "Invite resent");
      await qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: async (result) => {
      toast.success(result.message || "Team record deleted");
      await qc.invalidateQueries({ queryKey: ["team"] });
      await qc.invalidateQueries({ queryKey: ["team-overview"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

export function useBulkTeamAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: runBulkTeamAction,
    onSuccess: async (result) => {
      const { action, successCount, failureCount } = result.data;
      const verb =
        action === "resend"
          ? "invite resent"
          : action === "deactivate"
            ? "member deactivated"
            : "record deleted";

      if (successCount > 0) {
        toast.success(
          `${successCount} ${verb}${successCount === 1 ? "" : "s"}.`,
        );
      }
      if (failureCount > 0) {
        toast.warning(
          `${failureCount} record${failureCount === 1 ? "" : "s"} could not be processed.`,
        );
      }

      await qc.invalidateQueries({ queryKey: ["team"] });
      await qc.invalidateQueries({ queryKey: ["team-overview"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
