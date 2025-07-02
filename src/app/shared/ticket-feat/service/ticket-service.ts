import axios from 'axios';
import { TICKET_STATUS } from '@/app/shared/enums/enums';
import {
	ApiPaginatedResponse,
	ApiResponse,
	CreateTicketPayload,
	Ticket
} from '../../model/model';
import { API_ROUTES } from '../../routes/apiRoutes';
import { ListQueryParams, ProcessRequest, TicketListFilter } from '../model/ticket.model';
import { buildQueryString } from '@/utils/helpers';

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
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Request could not be created Status: ${err.response.status}`
			);
		}
		throw new Error('Request could not be created');
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
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Category could not be loaded Status: ${err.response.status}`
			);
		}
		throw new Error('Category could not be loaded');
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
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Ticket could not be loaded. Status: ${err.response.status}`
			);
		}
		throw new Error('Ticket could not be loaded');
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
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Ticket list could not be loaded Status: ${err.response.status}`
			);
		}
		throw new Error('Ticket list could not be loaded');
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
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Ticket could not be deleted Status: ${err.response.status}`
			);
		}
		throw new Error(`Ticket could not be deleted`);
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
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Ticket could not be updated Status: ${err.response.status}`
			);
		}
		throw new Error(`Ticket could not be updated`);
	}
}
export async function declineRequest(id: string, payload: ProcessRequest) {
	try {
		const res = await axios.patch(
			`${API_ROUTES.ticketManagement.update_status(id)}`,
			payload
		);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Ticket could not be updated Status: ${err.response.status}`
			);
		}
		throw new Error(`Ticket could not be updated`);
	}
}
