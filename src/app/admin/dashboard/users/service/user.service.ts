import {
	ApiPaginatedResponse,
	CreateUserPayload
} from '@/app/shared/model/model';
import { API_ROUTES } from '@/app/shared/routes/apiRoutes';
import axios from 'axios';
import { UserListFilter } from '../model/user.model';
import { buildQueryString } from '@/utils/helpers';
import { ListQueryParams } from '@/app/shared/ticket-feat/model/ticket.model';
import { ApiErrorHandler } from '@/utils/apiError';

export async function fetchUsers<T>({
	limit = 10,
	page = 1,
	search
}: ListQueryParams<UserListFilter>): Promise<ApiPaginatedResponse<T[]>> {
	const queryString = buildQueryString({ limit, page, ...search });
	const url = `${API_ROUTES.userManagement.get_users}?${queryString}`;
	try {
		const response = await axios(url);
		const data = await response.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}

export async function handleCreateUser(
	payload: CreateUserPayload,
	isEditing: boolean,
	userId?: string
) {
	try {
		const response = userId
			? await axios.patch(
					`${API_ROUTES.userManagement.userById(userId)}`,
					payload
				)
			: await axios.post(
					`${API_ROUTES.userManagement.invite_user}`,
					payload
				);

		const data = await response.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}

export async function handleDeleteUser(id: string) {
	try {
		const res = await axios.delete(
			`${API_ROUTES.userManagement.userById(id)}`
		);

		const data = await res.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
