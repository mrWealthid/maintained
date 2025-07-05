import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleCreateUser, handleDeleteUser } from '../service/user.service';
import { ApiError, CreateUserPayload } from '@/shared/model/model';

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
			toast.success('User successfully updated...');
			queryClient.invalidateQueries({
				queryKey: ['Users']
			});

			close?.();
		},
		onError: (err: any) => toast.error(err.message)
	});

	return { isCreating, createUser };
}

export function useDeleteUser() {
	const queryClient = useQueryClient();
	const { isPending: isDeleting, mutate: deleteUser } = useMutation({
		mutationFn: (id: string) => handleDeleteUser(id),
		onSuccess: () => {
			toast.success('Users successfully deleted');
			queryClient.invalidateQueries({
				queryKey: ['Users']
			});
		},
		onError: (err: ApiError) => toast.error(err.message)
	});

	return { isDeleting, deleteUser };
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
