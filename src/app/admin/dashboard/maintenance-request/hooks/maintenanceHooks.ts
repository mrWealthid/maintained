import { toast } from 'react-hot-toast';
import { IListResponse } from '@/components/table/models/table.model';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleDeleteRequest } from '../service/maintenance-service';
import { ApiError } from '@/components/shared/model/model';

// export function useCreateMaintenanceRequest(
// 	bookingId: string,
// 	isEditing: boolean
// 	// close: any
// ) {
// 	const queryClient = useQueryClient();
// 	const { isPending: isCreating, mutate: createMaintenance } = useMutation({
// 		mutationFn: (payload: FormData) =>
// 			handleCreateMaintenaceRequest(payload, bookingId, isEditing),
// 		onSuccess: () => {
// 			toast.success('Maintenance Request successfully created...');
// 			queryClient.invalidateQueries({
// 				queryKey: ['requests']
// 			});

// 			// close();
// 		},
// 		onError: (err: any) => toast.error(err.message)
// 	});

// 	return { isCreating, createMaintenance };
// }

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

export function useDeleteMaintenanceTicket() {
	const queryClient = useQueryClient();
	const { isPending: isDeleting, mutate: deleteTicket } = useMutation({
		mutationFn: (id: string) => handleDeleteRequest(id),
		onSuccess: () => {
			toast.success('Maintenance Request successfully deleted');
			queryClient.invalidateQueries({
				queryKey: ['requests', 5, 1, null]
			});
		},
		onError: (err: ApiError) => toast.error(err.message)
	});

	return { isDeleting, deleteTicket };
}
