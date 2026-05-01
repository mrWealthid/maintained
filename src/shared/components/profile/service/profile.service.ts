import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import { http } from "@/services/http";

export async function fetchProfile<T>(): Promise<T | undefined> {
  try {
    const response = await http(`${API_ROUTES.userManagement.get_user}`);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function switchBusiness<T>(payload: {
  currentBusiness: string;
}): Promise<{ data: T }> {
  try {
    const response = await http.patch(
      `${API_ROUTES.userManagement.switch_currentBusiness}`,
      payload
    );

    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
