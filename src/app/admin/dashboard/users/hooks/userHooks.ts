import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleCreateUser } from '../service/user.service';

export function useCreateUser(bookingId: any, isEditing: any, close: any) {
	const queryClient = useQueryClient();
	const { isPending: isCreating, mutate: createUser } = useMutation({
		mutationFn: (payload) => handleCreateUser(payload),
		// handleCreateMaintenaceRequest(payload, bookingId, isEditing),

		onSuccess: () => {
			toast.success('Maintenance Request successfully created...');
			queryClient.invalidateQueries({
				queryKey: ['requests']
			});

			close();
		},
		onError: (err: any) => toast.error(err.message)
	});

	return { isCreating, createUser };
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
