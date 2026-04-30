import axios from "axios";

import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import { buildQueryString } from "@/utils/helpers";

import type {
  TeamInviteFormValues,
  TeamListQuery,
  TeamRoleUpdateValues,
} from "../models/team-form.model";

/**
 * Team = workspace staff (owner, property_manager, maintenance_coordinator,
 * accountant, member). Tenants and technicians are surfaced through their
 * own feature services.
 */

export async function fetchTeamList(query: TeamListQuery) {
  try {
    const qs = buildQueryString(query);
    const { data } = await axios.get(
      `${API_ROUTES.userManagement.get_users}?${qs}`,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchTeamMember(id: string) {
  try {
    const { data } = await axios.get(API_ROUTES.userManagement.userById(id));
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function inviteTeamMember(payload: TeamInviteFormValues) {
  try {
    const { data } = await axios.post(
      API_ROUTES.userManagement.invite_user,
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateTeamMemberRole(
  id: string,
  payload: TeamRoleUpdateValues,
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

export async function removeTeamMember(id: string) {
  try {
    const { data } = await axios.delete(
      API_ROUTES.userManagement.userById(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
