import axios from 'axios';

export async function handleCreateMaintenaceRequest(
	data: FormData,
	booking: any,
	isEditing: any
) {
	try {
		const res = isEditing
			? await axios.patch(`/api/bookings/${booking.id}`, data)
			: await axios.post(
					`/api/maintenance/request`,
					data
					// responseType: 'stream',
					// headers: {
					// 	'Content-Type': 'multipart/form-data'
					// }
			  );

		const resData = await res.data;
		return resData;
	} catch (err: any) {
		throw new Error(
			`Request could not be created Status: ${err.response.status}`
		);
	}
}

export async function fetchMaintenanceRequests(
	status: any,
	page: number = 1,
	limit: number = 10
) {
	// const calcDate = new Date(new Date().setDate(new Date().getDate() - days));

	const url =
		status === 'ALL'
			? `/api/maintenance/request?limit=${limit}&page=${page}`
			: `/api/maintenance/request?limit=${limit}&page=${page}&status=${status}`;
	try {
		const response = await axios(url);
		const data = await response.data;
		return data;
	} catch (err: any) {
		throw new Error(
			`Requests could not be loaded Status: ${err.response.status}`
		);
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
	} catch (err: any) {
		throw new Error(
			`Category could not be loaded Status: ${err.response.status}`
		);
	}
}
