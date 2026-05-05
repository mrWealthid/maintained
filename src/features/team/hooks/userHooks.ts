import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  handleInviteUser,
  handleInviteUsers,
  handleDeleteUser,
  handleReInviteUser,
} from "../services/user.service";
import {
  ApiError,
  InviteUsersPayload,
  InviteUserPayload,
} from "@/shared/model/model";

export function useInviteUser(
  isEditing: boolean,
  close?: () => void,
  userId?: string
) {
  const queryClient = useQueryClient();
  const {
    isPending: isInviting,
    mutate: inviteUser,
    error: inviteUserError,
  } = useMutation({
    mutationFn: (payload: InviteUserPayload) =>
      handleInviteUser(payload, isEditing, userId),

    onSuccess: () => {
      toast.success("Invite sent successfully...");
      queryClient.invalidateQueries({ queryKey: ["Users"] });
      close?.();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { isInviting, inviteUser, inviteUserError };
}

export function useInviteUsers(isEditing: boolean, close?: () => void) {
  const queryClient = useQueryClient();
  const { isPending: isInviting, mutate: inviteUsers } = useMutation({
    mutationFn: (payload: InviteUsersPayload) => handleInviteUsers(payload),

    onSuccess: (data) => {
      toast.success(`Successfully created ${data.count} user invites`);
      queryClient.invalidateQueries({ queryKey: ["Users"] });

      if (data.errors && data.errors.length > 0) {
        toast.error(`${data.errors.length} users failed to create`);
      }

      close?.();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { isInviting, inviteUsers };
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { isPending: isDeleting, mutate: deleteUser } = useMutation({
    mutationFn: (id: string) => handleDeleteUser(id),
    onSuccess: () => {
      toast.success("User successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["Users"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isDeleting, deleteUser };
}

export function useReInviteUser() {
  const queryClient = useQueryClient();
  const { isPending: isInviting, mutate: reInviteUser } = useMutation({
    mutationFn: (payload: { email: string; force?: boolean }) =>
      handleReInviteUser(payload),
    onSuccess: () => {
      toast.success("Invite resent successfully");
      queryClient.invalidateQueries({ queryKey: ["Users"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isInviting, reInviteUser };
}
