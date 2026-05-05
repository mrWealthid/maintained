import { http } from "@/services/http";
import { ApiResponse } from "@/shared/model/model";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import type { AppSettingsPayload } from "../models/app-settings.model";

export async function fetchAppSettings(): Promise<
  ApiResponse<AppSettingsPayload>
> {
  try {
    const { data } = await http.get(API_ROUTES.appSettings.root);
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function saveAppSettings(
  payload: AppSettingsPayload,
): Promise<ApiResponse<AppSettingsPayload>> {
  try {
    const { data } = await http.patch(
      API_ROUTES.appSettings.root,
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
