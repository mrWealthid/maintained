import { http } from "@/services/http";

import { ROLES } from "@/shared/enums/enums";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import { buildQueryString } from "@/utils/helpers";

import type {
  TechnicianInviteFormValues,
  TechnicianListQuery,
} from "../models/technician-form.model";

export async function fetchTechnicianList(query: TechnicianListQuery) {
  try {
    const qs = buildQueryString({ ...query, role: ROLES.technician });
    const { data } = await http.get(
      `${API_ROUTES.userManagement.get_users}?${qs}`,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchTechnicianById(id: string) {
  try {
    const { data } = await http.get(API_ROUTES.userManagement.userById(id));
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function inviteTechnician(payload: TechnicianInviteFormValues) {
  try {
    const { data } = await http.post(
      API_ROUTES.userManagement.invite_user,
      { ...payload, role: ROLES.technician },
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateTechnician(
  id: string,
  payload: Partial<TechnicianInviteFormValues>,
) {
  try {
    const { data } = await http.patch(
      API_ROUTES.userManagement.userById(id),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function removeTechnician(id: string) {
  try {
    const { data } = await http.delete(
      API_ROUTES.userManagement.userById(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
