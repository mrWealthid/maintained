import { http } from "@/services/http";
import { fetchListForTable } from "@/shared/helper/helper";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import type {
  WorkspaceListFilter,
  WorkspaceListRowDTO,
} from "../models/workspace-list.model";

export type BulkWorkspaceAction = "activate" | "deactivate";

export type BulkWorkspaceActionResponse = {
  status: string;
  data: {
    action: BulkWorkspaceAction;
    requestedCount: number;
    successCount: number;
    skippedCount?: number;
    failureCount?: number;
  };
};

export const workspaceListService = ({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: WorkspaceListFilter | null;
}) => {
  return fetchListForTable<WorkspaceListRowDTO, WorkspaceListFilter>({
    route: API_ROUTES.workspaces.get_all,
    page,
    limit,
    search,
  });
};

export async function updateWorkspaceStatus(id: string, isActive: boolean) {
  try {
    const { data } = await http.patch<{ status: string; data: unknown }>(
      API_ROUTES.workspaces.byId(id),
      { isActive },
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function runBulkWorkspaceAction(args: {
  action: BulkWorkspaceAction;
  workspaceIds: string[];
}) {
  try {
    const { data } = await http.post<BulkWorkspaceActionResponse>(
      API_ROUTES.workspaces.bulkActions,
      args,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
