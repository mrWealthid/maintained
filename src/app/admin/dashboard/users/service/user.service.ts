import {
  ApiPaginatedResponse,
  CreateMultipleUsersPayload,
  CreateUserPayload,
} from "@/shared/model/model";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import axios from "axios";
import { UserListFilter } from "../model/user.model";
import { buildQueryString } from "@/utils/helpers";
import { ListQueryParams } from "@/features/ticket-feat/model/ticket.model";
import { ApiErrorHandler } from "@/utils/apiError";

export async function fetchUsers<T>({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<UserListFilter>): Promise<ApiPaginatedResponse<T[]>> {
  const queryString = buildQueryString({ limit, page, ...search });
  const url = `${API_ROUTES.userManagement.get_users}?${queryString}`;
  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
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
      : await axios.post(`${API_ROUTES.userManagement.invite_user}`, payload);

    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleCreateMultipleUsers(
  payload: CreateMultipleUsersPayload
) {
  try {
    const response = await axios.post(
      `${API_ROUTES.userManagement.invite_user}`,
      payload.users
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleDeleteUser(id: string) {
  try {
    const res = await axios.delete(`${API_ROUTES.userManagement.userById(id)}`);

    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function handleReInviteUser(payload: {
  email: string;
  force?: boolean;
}) {
  try {
    const res = await axios.patch(
      `${API_ROUTES.userManagement.invite_user}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
