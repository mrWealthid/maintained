"use client";

import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { http } from "@/services/http";
import { buildQueryString } from "@/utils/helpers";
import { ApiErrorHandler } from "@/utils/apiError";
import { fetchListForTable } from "@/shared/helper/helper";
import type {
  TeamDeactivatePayload,
  TeamInvitePayload,
  TeamListBulkAction,
  TeamListFilter,
  TeamListItem,
  TeamListResponse,
  TeamRoleUpdatePayload,
} from "../models/team.model";

export async function fetchTeamOverview(search?: TeamListFilter | null) {
  const query = buildQueryString({ limit: 5, page: 1, ...(search ?? {}) });
  const url = query
    ? `${API_ROUTES.team.list}?${query}`
    : API_ROUTES.team.list;

  try {
    const { data } = await http.get<{
      status: string;
      data: TeamListResponse["data"];
      totalRecords: number;
      results: number;
      summary: TeamListResponse["summary"];
      meta: TeamListResponse["meta"];
    }>(url);

    return {
      data: data.data,
      totalRecords: data.totalRecords,
      results: data.results,
      summary: data.summary,
      meta: data.meta,
    } satisfies TeamListResponse;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export const teamListService = ({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: TeamListFilter | null;
}) => {
  return fetchListForTable<TeamListItem, TeamListFilter>({
    route: API_ROUTES.team.list,
    page,
    limit,
    search,
  });
};

export async function inviteWorkspaceTeamMember(payload: TeamInvitePayload) {
  try {
    const { data } = await http.post<{ status: string; message: string }>(
      API_ROUTES.team.list,
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateTeamRole(
  id: string,
  payload: TeamRoleUpdatePayload,
) {
  try {
    const { data } = await http.patch<{ status: string; message: string }>(
      API_ROUTES.team.byId(id),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deactivateTeamMember(
  id: string,
  payload: TeamDeactivatePayload = { action: "deactivate" },
) {
  try {
    const { data } = await http.patch<{ status: string; message: string }>(
      API_ROUTES.team.byId(id),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function resendTeamInvite(id: string) {
  try {
    const { data } = await http.post<{ status: string; message: string }>(
      API_ROUTES.team.resend(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteTeamMember(id: string) {
  try {
    const { data } = await http.delete<{ status: string; message: string }>(
      API_ROUTES.team.byId(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function runBulkTeamAction({
  action,
  memberIds,
}: {
  action: TeamListBulkAction;
  memberIds: string[];
}) {
  const bulkOperationMap: Record<
    TeamListBulkAction,
    (id: string) => Promise<unknown>
  > = {
    resend: resendTeamInvite,
    deactivate: (id: string) => deactivateTeamMember(id),
    delete: deleteTeamMember,
  };
  const operation = bulkOperationMap[action];

  const results = await Promise.allSettled(
    memberIds.map((id) => operation(id)),
  );
  const successCount = results.filter(
    (result) => result.status === "fulfilled",
  ).length;
  const failureCount = results.length - successCount;
  const firstError = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  )?.reason;

  if (successCount === 0 && firstError) {
    throw firstError;
  }

  return {
    data: { action, successCount, failureCount },
  };
}
