"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiErrorHandler } from "@/utils/apiError";

import {
  fetchTeamList,
  fetchTeamMember,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
} from "../services/team-service";
import type {
  TeamInviteFormValues,
  TeamListQuery,
  TeamRoleUpdateValues,
} from "../models/team-form.model";

export const TEAM_KEYS = {
  all: ["team"] as const,
  list: (query: TeamListQuery) => ["team", "list", query] as const,
  byId: (id: string) => ["team", id] as const,
} as const;

export function useTeamList(query: TeamListQuery) {
  return useQuery({
    queryKey: TEAM_KEYS.list(query),
    queryFn: () => fetchTeamList(query),
    placeholderData: (previous) => previous,
  });
}

export function useTeamMember(id: string | undefined) {
  return useQuery({
    queryKey: id ? TEAM_KEYS.byId(id) : ["team", "noop"],
    queryFn: () => fetchTeamMember(id as string),
    enabled: Boolean(id),
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TeamInviteFormValues) => inviteTeamMember(payload),
    onSuccess: () => {
      toast.success("Invitation sent");
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}

export function useUpdateTeamMemberRole(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TeamRoleUpdateValues) =>
      updateTeamMemberRole(id, payload),
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeTeamMember(id),
    onSuccess: () => {
      toast.success("Team member removed");
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.parse(err)),
  });
}
