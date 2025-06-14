import {
	MaintenanceRequestPayload
} from '@/components/shared/model/model';
import axios from 'axios';

export async function handleCreateMaintenaceRequest(
	data: MaintenanceRequestPayload,
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
