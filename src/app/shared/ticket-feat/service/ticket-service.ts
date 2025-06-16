import { TICKET_STATUS } from '@/utils/enums';
import axios from 'axios';
import { TicketStatus } from '../model/ticket.model';
import { CreateTicketPayload } from '../../model/model';

export async function createTicket(
	data: CreateTicketPayload,
	isEditing: boolean,
	requestId?: string
) {
	try {
		const res = isEditing
			? await axios.patch(`/api/maintenance/request/${requestId}`, data)
			: await axios.post(`/api/maintenance/request`, data);

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
		? `/api/maintenance/category?name=${query}`
		: `/api/maintenance/category`;
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
			? `/api/maintenance/request?limit=${limit}&page=${page}`
			: `/api/maintenance/request?limit=${limit}&page=${page}&status=${status}`;
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
		? `/api/maintenance/request?limit=${limit}&page=${page}&${query}`
		: `/api/maintenance/request?limit=${limit}&page=${page}`;
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
		const res = await axios.delete(`/api/maintenance/request/${id}`);
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
