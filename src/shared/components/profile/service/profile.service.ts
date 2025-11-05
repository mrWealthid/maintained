import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import axios from "axios";

export async function fetchProfile<T>(): Promise<T | undefined> {
  try {
    const response = await axios(`${API_ROUTES.userManagement.get_user}`);
    return response.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function switchBusiness<T>(payload: {
  currentBusiness: string;
}): Promise<{ data: T }> {
  try {
    const response = await axios.patch(
      `${API_ROUTES.userManagement.switch_currentBusiness}`,
      payload
    );

    return response.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
