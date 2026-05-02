import { http } from "@/services/http";
import { ApiErrorHandler } from "@/utils/apiError";

export async function fetchDashboardChecklist() {
  try {
    const response = await http.get("/api/onboarding/checklist");
    return response.data;
  } catch (err) {
    throw ApiErrorHandler.toUIError(err);
  }
}
