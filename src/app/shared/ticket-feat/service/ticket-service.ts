import axios from 'axios';
import { TICKET_STATUS } from '@/utils/enums';
import { CreateTicketPayload } from '../../model/model';
import { API_ROUTES } from '../../routes/apiRoutes';

export async function createTicket(
	data: CreateTicketPayload,
	isEditing: boolean,
	requestId?: string
) {
	try {
		const res = isEditing
			? await axios.patch(
					`${API_ROUTES.ticketManagement.ticketById}/${requestId}`,
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

export async function fetchTicketCategory(query: string | null) {
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

export async function fetchTickets(
	status: TICKET_STATUS,
	page: number = 1,
	limit: number = 10
) {
	// const calcDate = new Date(new Date().setDate(new Date().getDate() - days));

	const url =
		status === TICKET_STATUS.all
			? `${API_ROUTES.ticketManagement.get_tickets}?limit=${limit}&page=${page}`
			: `${API_ROUTES.ticketManagement.get_tickets}?limit=${limit}&page=${page}&status=${status}`;
	try {
		const response = await axios(url);
		const data = await response.data;
		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Requests could not be loaded Status: ${err.response.status}`
			);
		}

		throw new Error('Requests could not be loaded');
	}
}

export async function fetchTicketList(
	page: number,
	limit: number,
	query: string | null
) {
	const url = query
		? `${API_ROUTES.ticketManagement.get_tickets}?limit=${limit}&page=${page}&${query}`
		: `${API_ROUTES.ticketManagement.get_tickets}?limit=${limit}&page=${page}`;
	try {
		const response = await axios(url);
		const data = await response.data;
		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Requests could not be loaded Status: ${err.response.status}`
			);
		}
		throw new Error('Requests could not be loaded');
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
				`Request could not be deleted Status: ${err.response.status}`
			);
		}
		throw new Error(`Request could not be deleted`);
	}
}
