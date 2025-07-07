import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	assignTechnician,
	assignTicket,
	createTicket,
	deleteTicket,
	fetchTickets,
	ProcessTechnicianResponse
} from '../service/ticket-service';
import {
	ListQueryParams,
	ProcessRequest,
	TicketListFilter,
	TicketStatus
} from '../model/ticket.model';
import { CreateTicketPayload, Ticket } from '../../model/model';
import { ApiError } from 'next/dist/server/api-utils';
import { IListResponse } from '@/app/shared/components/table/models/table.model';
import { TICKET_STATUS } from '@/app/shared/enums/enums';

export function useCreateTicket(isEditing: boolean, ticketId?: string) {
	const queryClient = useQueryClient();
	const { isPending: isCreating, mutate: handleCreateTicket } = useMutation({
		mutationFn: (payload: CreateTicketPayload) =>
			createTicket(payload, isEditing, ticketId),
		onSuccess: () => {
			toast.success(
				`Maintenance Request successfully ${isEditing ? 'updated' : 'created'}...`
			);
			queryClient.invalidateQueries({
				queryKey: ['tickets']
			});

			// close();
		},
		onError: (err: ApiError) => toast.error(err.message)
	});

	return { isCreating, handleCreateTicket };
}

export function useFetchTickets<T>(
	status: TICKET_STATUS,
	search: TicketListFilter,
	page: number = 1,
	limit: number = 10
) {
	const { isLoading, data, error, isRefetching } = useQuery({
		queryKey: ['tickets', status, search],
		queryFn: () => fetchTickets<T>({ page, limit, status, search })
	});

	return {
		isLoading,
		error,
		isRefetching,
		...data
	};
}

export function useDeleteTicket() {
	const queryClient = useQueryClient();
	const { isPending: isDeleting, mutate: handleDeleteTicket } = useMutation({
		mutationFn: (id: string) => deleteTicket(id),
		onSuccess: () => {
			toast.success('Maintenance Request successfully deleted');
			queryClient.invalidateQueries({
				queryKey: ['tickets']
			});
		},
		onError: (err: ApiError) => toast.error(err.message)
	});

	return { isDeleting, handleDeleteTicket };
}
export function useAssignTicket(id: string) {
	const queryClient = useQueryClient();
	const { isPending: isUpdating, mutate: handleAssignTicket } = useMutation({
		mutationFn: (payload: Pick<Ticket, 'status'>) =>
			assignTicket(id, payload),
		onSuccess: () => {
			toast.success('Ticket successfully assigned');
			queryClient.invalidateQueries({
				queryKey: ['tickets']
			});
		},
		onError: (err: ApiError) => toast.error(err.message)
	});

	return { isUpdating, handleAssignTicket };
}
export function useProcessTechnicianResponse(id: string, close?: () => void) {
	const queryClient = useQueryClient();
	const { isPending: isProcessing, mutate: processResponse } = useMutation({
		mutationFn: (payload: ProcessRequest) =>
			ProcessTechnicianResponse(id, payload),
		onSuccess: () => {
			toast.success('Ticket successfully updated');
			queryClient.invalidateQueries({
				queryKey: ['tickets']
			});
			close?.();
		},
		onError: (err: ApiError) => toast.error(err.message)
	});

	return { isProcessing, processResponse };
}
export function useAssignTechnician(id: string, close?: () => void) {
	const queryClient = useQueryClient();
	const { isPending: isAssigning, mutate: handleAssignTechnician } =
		useMutation({
			mutationFn: (payload: { assignedTo: string }) =>
				assignTechnician(id, payload),
			onSuccess: () => {
				toast.success('Ticket successfully assigned');
				queryClient.invalidateQueries({
					queryKey: ['tickets']
				});
				close?.();
			},
			onError: (err: ApiError) => toast.error(err.message)
		});

	return { isAssigning, handleAssignTechnician };
}
