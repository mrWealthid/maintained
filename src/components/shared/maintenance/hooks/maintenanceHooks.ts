import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleCreateMaintenaceRequest } from '../service/maintenance-service';
import {
	ApiError,
	MaintenanceRequestPayload
} from '@/components/shared/model/model';

export function useCreateMaintenanceRequest(
	isEditing: boolean,
	requestId?: string
) {
	const queryClient = useQueryClient();
	const { isPending: isCreating, mutate: createMaintenance } = useMutation({
		mutationFn: (payload: MaintenanceRequestPayload) =>
			handleCreateMaintenaceRequest(payload, isEditing, requestId),
		onSuccess: () => {
			toast.success('Maintenance Request successfully created...');
			queryClient.invalidateQueries({
				queryKey: ['requests']
			});

			// close();
		},
		onError: (err: ApiError) => toast.error(err.message)
	});

	return { isCreating, createMaintenance };
}
