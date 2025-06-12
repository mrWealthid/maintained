import axios from 'axios';

export async function handleCreateMaintenaceRequest(
	data: FormData,
	booking: any,
	isEditing: any
) {
	try {
		const res = isEditing
			? await axios.patch(`/api/bookings/${booking.id}`, data)
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

export async function fetchMaintenanceRequestList(
	page: number,
	limit: number,
	query: string | null
) {
	// const calcDate = new Date(new Date().setDate(new Date().getDate() - days));

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
export async function fetchCategory(query: string | null) {
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

export async function handleDeleteRequest(id: string) {
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
