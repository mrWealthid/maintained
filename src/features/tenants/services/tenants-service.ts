import { http } from "@/services/http";

import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import { buildQueryString } from "@/utils/helpers";

import type {
  TenantInviteFormValues,
  TenantListQuery,
} from "../models/tenant-form.model";

/**
 * Tenants are workspace-scoped residents tied to a property and unit.
 * They are managed separately from staff/team members.
 */

export async function fetchTenantList(query: TenantListQuery) {
  try {
    const qs = buildQueryString(query);
    const { data } = await http.get(`${API_ROUTES.tenants.list}?${qs}`);
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchTenantById(id: string) {
  try {
    const { data } = await http.get(
      API_ROUTES.tenants.byId(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function inviteTenant(payload: TenantInviteFormValues) {
  try {
    const { data } = await http.post(
      API_ROUTES.tenants.list,
      payload,
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
    const { data } = await http.patch(
      API_ROUTES.tenants.byId(id),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function removeTenant(id: string) {
  try {
    const { data } = await http.delete(
      API_ROUTES.tenants.byId(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
