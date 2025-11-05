import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  handleCreateUser,
  handleCreateMultipleUsers,
  handleDeleteUser,
  handleReInviteUser,
} from "../service/user.service";
import {
  ApiError,
  CreateMultipleUsersPayload,
  CreateUserPayload,
} from "@/shared/model/model";

export function useCreateUser(
  isEditing: boolean,
  close?: () => void,
  userId?: string
) {
  const queryClient = useQueryClient();
  const { isPending: isCreating, mutate: createUser } = useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      handleCreateUser(payload, isEditing, userId),

    onSuccess: () => {
      toast.success("Invite sent successfully...");
      queryClient.invalidateQueries({
        queryKey: ["Users"],
      });

      close?.();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { isCreating, createUser };
}

export function useCreateMultipleUsers(isEditing: boolean, close?: () => void) {
  const queryClient = useQueryClient();
  const { isPending: isCreating, mutate: createMultipleUsers } = useMutation({
    mutationFn: (payload: CreateMultipleUsersPayload) =>
      handleCreateMultipleUsers(payload),

    onSuccess: (data) => {
      toast.success(`Successfully created ${data.count} user invites`);
      queryClient.invalidateQueries({
        queryKey: ["Users"],
      });

      if (data.errors && data.errors.length > 0) {
        toast.error(`${data.errors.length} users failed to create`);
      }

      close?.();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { isCreating, createMultipleUsers };
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { isPending: isDeleting, mutate: deleteUser } = useMutation({
    mutationFn: (id: string) => handleDeleteUser(id),
    onSuccess: () => {
      toast.success("User successfully deleted");
      queryClient.invalidateQueries({
        queryKey: ["Users"],
      });
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
      queryClient.invalidateQueries({
        queryKey: ["Users"],
      });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isInviting, reInviteUser };
}
// export function useFetchMaintenanceRequests(
// 	status: string,
// 	page: number = 1,
// 	limit: number = 10
// ): IListResponse {
// 	const { isLoading, data, error, isRefetching } = useQuery({
// 		queryKey: ['requests', status],
// 		queryFn: () => fetchMaintenanceRequests(status, page, limit)
// 	});

// 	return {
// 		isLoading,
// 		error,
// 		isRefetching,
// 		...data
// 	};
// }
