import { http } from "@/services/http";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import type { WorkspaceType } from "@/shared/model/workspace.model";
import type { CreateWorkspaceValues } from "@/shared/model/workspace-create.model";

type SwitchWorkspaceResponse = {
  ok: boolean;
  message?: string;
  data: {
    businessId: string;
  };
};

type UpgradeWorkspaceResponse = {
  ok: boolean;
  message?: string;
  data: {
    workspaceType: WorkspaceType;
    workspaceLabel: string;
  };
};

type CreateWorkspaceResponse = {
  ok: boolean;
  message?: string;
  data: {
    businessId: string;
  };
};

export async function switchWorkspace(
  businessId: string,
): Promise<SwitchWorkspaceResponse> {
  try {
    const { data } = await http.post<SwitchWorkspaceResponse>(
      API_ROUTES.auth.workspaceSwitch,
      { businessId },
    );
    return data;
  } catch (error: unknown) {
    throw ApiErrorHandler.toUIError(error);
  }
}

export async function createWorkspace(
  payload: CreateWorkspaceValues,
): Promise<CreateWorkspaceResponse> {
  try {
    const { data } = await http.post<CreateWorkspaceResponse>(
      API_ROUTES.auth.workspaceCreate,
      payload,
    );
    return data;
  } catch (error: unknown) {
    throw ApiErrorHandler.toUIError(error);
  }
}

export async function upgradeCurrentWorkspace(): Promise<UpgradeWorkspaceResponse> {
  try {
    const { data } = await http.post<UpgradeWorkspaceResponse>(
      API_ROUTES.auth.workspaceUpgrade,
      {},
    );
    return data;
  } catch (error: unknown) {
    throw ApiErrorHandler.toUIError(error);
  }
}
