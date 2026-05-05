import {
  ApiPaginatedResponse,
  InviteUsersPayload,
  InviteUserPayload,
  User,
} from "@/shared/model/model";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { http } from "@/services/http";
import { UserListFilter } from "../models/user.model";
import { buildQueryString } from "@/utils/helpers";
import { ListQueryParams } from "@/features/tickets/models/ticket.model";
import { ApiErrorHandler } from "@/utils/apiError";

type TablePaginatedResponse<T> = ApiPaginatedResponse<T> & {
  summary: Record<string, number>;
};

function withSummary<T>(
  response: ApiPaginatedResponse<T> & { summary?: Record<string, number> }
): TablePaginatedResponse<T> {
  return {
    ...response,
    summary: response.summary ?? {},
  };
}

export async function fetchUsers({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<UserListFilter>): Promise<TablePaginatedResponse<User[]>> {
  const queryString = buildQueryString({ limit, page, ...search });
  const url = `${API_ROUTES.userManagement.get_users}?${queryString}`;
  try {
    const response = await http(url);
    return withSummary(response.data);
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleInviteUser(
  payload: InviteUserPayload,
  isEditing: boolean,
  userId?: string
) {
  try {
    const response = userId
      ? await http.patch(
          `${API_ROUTES.userManagement.userById(userId)}`,
          payload
        )
      : await http.post(`${API_ROUTES.userManagement.invite_user}`, payload);

    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleInviteUsers(payload: InviteUsersPayload) {
  try {
    const response = await http.post(
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
    const res = await http.delete(`${API_ROUTES.userManagement.userById(id)}`);

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
    const res = await http.patch(
      `${API_ROUTES.userManagement.invite_user}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
