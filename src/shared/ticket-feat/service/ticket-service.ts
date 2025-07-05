import axios from 'axios';
import { ROLES, TICKET_STATUS } from '@/shared/enums/enums';
import {
	ApiPaginatedResponse,
	ApiResponse,
	CreateTicketPayload,
	Ticket
} from '../../model/model';
import { API_ROUTES } from '../../routes/apiRoutes';
import {
	ListQueryParams,
	ProcessRequest,
	TicketListFilter
} from '../model/ticket.model';
import { buildQueryString } from '@/utils/helpers';
import { ApiErrorHandler } from '@/utils/apiError';

export async function createTicket(
	data: CreateTicketPayload,
	isEditing: boolean,
	requestId?: string
) {
	try {
		const res = requestId
			? await axios.patch(
					`${API_ROUTES.ticketManagement.ticketById(requestId)}`,
					data
				)
			: await axios.post(
					`${API_ROUTES.ticketManagement.create_ticket}`,
					data
				);

		const resData = await res.data;
		return resData;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}

export async function fetchTicketCategory<T>(
	query: string | null
): Promise<ApiResponse<T[]>> {
	const url = query
		? `${API_ROUTES.ticketManagement.get_categories}?name=${query}`
		: `${API_ROUTES.ticketManagement.get_categories}`;
	try {
		const response = await axios(url);

		const data = await response.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
export async function fetchTechnicians<T>(
	query: string | null
): Promise<ApiResponse<T[]>> {
	const url = query
		? `${API_ROUTES.userManagement.get_users}?role=${ROLES.technician}&name=${query}`
		: `${API_ROUTES.userManagement.get_users}?role=${ROLES.technician}`;
	try {
		const response = await axios(url);
		const data = await response.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}

export async function fetchTickets<T>({
	limit = 10,
	page = 1,
	search,
	status
}: ListQueryParams<TicketListFilter>): Promise<ApiPaginatedResponse<T[]>> {
	const queryString = buildQueryString({
		limit,
		page,
		...search,
		...(status !== TICKET_STATUS.all && { status })
	});

	const url = `${API_ROUTES.ticketManagement.get_tickets}?${queryString}`;
	try {
		const response = await axios(url);
		return response.data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}

export async function fetchTicketList<T>({
	limit = 10,
	page = 1,
	search
}: ListQueryParams<TicketListFilter>): Promise<ApiPaginatedResponse<T[]>> {
	const queryString = buildQueryString({ limit, page, ...search });
	const url = `${API_ROUTES.ticketManagement.get_tickets}?${queryString}`;

	try {
		const response = await axios(url);
		const data = await response.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}

export async function deleteTicket(id: string) {
	try {
		const res = await axios.delete(
			`${API_ROUTES.ticketManagement.ticketById(id)}`
		);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
export async function assignTicket(
	id: string,
	payload: Pick<Ticket, 'status'>
) {
	try {
		const res = await axios.patch(
			`${API_ROUTES.ticketManagement.update_status(id)}`,
			payload
		);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
export async function ProcessTechnicianResponse(
	id: string,
	payload: ProcessRequest
) {
	try {
		const res = await axios.patch(
			`${API_ROUTES.ticketManagement.process_technician_response(id)}`,
			payload
		);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
export async function assignTechnician(
	id: string,
	payload: { assignedTo: string }
) {
	try {
		const res = await axios.patch(
			`${API_ROUTES.ticketManagement.assign_technician(id)}`,
			payload
		);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
