import { CreateUserPayload } from '@/app/shared/model/model';
import { API_ROUTES } from '@/app/shared/routes/apiRoutes';
import axios from 'axios';

export async function fetchUsers(
	page: number,
	limit: number,
	search: string | null
) {
	const url = !search
		? `${API_ROUTES.userManagement.get_users}?limit=${limit}&page=${page}`
		: `${API_ROUTES.userManagement.get_users}?limit=${limit}&page=${page}&${search}`;
	try {
		const response = await axios(url);

		const data = await response.data;

		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`User could not be fetched Status: ${err.response.status}`
			);
		}
		throw new Error('User could not be fetched');
	}
}

export async function handleCreateUser(
	payload: CreateUserPayload,
	isEditing: boolean,
	userId?: string
) {
	try {
		const response = isEditing
			? await axios.patch(
					`${API_ROUTES.userManagement.userById}/${userId}`,
					payload
				)
			: await axios.post(
					`${API_ROUTES.userManagement.invite_user}`,
					payload
				);

		const data = await response.data;
		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`User could not be ${isEditing ? 'updated' : 'created'} Status: ${err.response.status}`
			);
		}
		throw new Error(
			`User could not be ${isEditing ? 'updated' : 'created'} `
		);
	}
}

export async function handleDeleteUser(id: string) {
	try {
		const res = await axios.delete(
			`${API_ROUTES.userManagement.userById}/${id}`
		);

		const data = await res.data;
		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`User could not be deleted Status: ${err.response.status}`
			);
		}
		throw new Error('User could not be deleted');
	}
}
