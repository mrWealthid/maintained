"use client";

import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { http } from "@/services/http";
import { ApiErrorHandler } from "@/utils/apiError";
import type {
  WorkspaceRoleDefinitionPayload,
  TeamRolesResponse,
} from "../models/access-control.model";

export async function fetchWorkspaceRoles(): Promise<TeamRolesResponse> {
  try {
    const { data } = await http.get<{
      status: string;
      data: TeamRolesResponse;
    }>(API_ROUTES.team.roles);
    return data.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createWorkspaceRole(
  payload: WorkspaceRoleDefinitionPayload,
) {
  try {
    const { data } = await http.post<{ status: string; message: string }>(
      API_ROUTES.team.roles,
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateWorkspaceRole(
  id: string,
  payload: WorkspaceRoleDefinitionPayload,
) {
  try {
    const { data } = await http.patch<{ status: string; message: string }>(
      `${API_ROUTES.team.roles}/${id}`,
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function archiveWorkspaceRole(id: string) {
  try {
    const { data } = await http.delete<{ status: string; message: string }>(
      `${API_ROUTES.team.roles}/${id}`,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
