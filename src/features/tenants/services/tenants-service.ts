import axios from "axios";

import { ROLES } from "@/shared/enums/enums";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import { buildQueryString } from "@/utils/helpers";

import type {
  TenantInviteFormValues,
  TenantListQuery,
} from "../models/tenant-form.model";

/**
 * Tenants are USER_TYPE.tenant actors. They are stored in the User
 * collection with a membership of role=USER, scoped to a property+unit.
 * The list endpoint reuses /api/users with role=USER.
 */

export async function fetchTenantList(query: TenantListQuery) {
  try {
    const qs = buildQueryString({ ...query, role: ROLES.user });
    const { data } = await axios.get(
      `${API_ROUTES.userManagement.get_users}?${qs}`,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchTenantById(id: string) {
  try {
    const { data } = await axios.get(
      API_ROUTES.userManagement.userById(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function inviteTenant(payload: TenantInviteFormValues) {
  try {
    const { data } = await axios.post(
      API_ROUTES.userManagement.invite_user,
      { ...payload, role: ROLES.user },
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateTenant(
  id: string,
  payload: Partial<TenantInviteFormValues>,
) {
  try {
    const { data } = await axios.patch(
      API_ROUTES.userManagement.userById(id),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function removeTenant(id: string) {
  try {
    const { data } = await axios.delete(
      API_ROUTES.userManagement.userById(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
