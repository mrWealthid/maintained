import { IListResponse } from '@/components/Table/models/table.model';
import { useQuery } from '@tanstack/react-query';
import { fetchMaintenanceRequests } from '../service/maintenance-service';

export function useCreateMaintenanceRequest(
	bookingId: any,
	isEditing: any,
	close: any
) {
	// const queryClient = useQueryClient();
	// const { isLoading: isCreating, mutate: createBooking } = useMutation({
	// 	mutationFn: (payload) =>
	// 		handleCreateBooking(payload, bookingId, isEditing),
	// 	onSuccess: () => {
	// 		toast.success('Bookings successfully created...');
	// 		queryClient.invalidateQueries({
	// 			queryKey: ['bookings']
	// 		});

	// 		close();
	// 	},
	// 	onError: (err: any) => toast.error(err.message)
	// });

	return { isCreating: false, createMaintenance: (val: any) => {} };
}

export function useFetchMaintenanceRequests(
	status: string,
	page: number = 1,
	limit: number = 10
): IListResponse {
	const { isLoading, data, error, isRefetching } = useQuery({
		queryKey: ['requests', status],
		queryFn: () => fetchMaintenanceRequests(status, page, limit)
	});

	return {
		isLoading,
		error,
		isRefetching,
		...data
	};
}
