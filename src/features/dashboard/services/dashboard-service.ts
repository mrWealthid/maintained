import axios from "axios";
import { ApiErrorHandler } from "@/utils/apiError";

export async function fetchDashboardChecklist() {
  try {
    const response = await axios.get("/api/onboarding/checklist");
    return response.data;
  } catch (err) {
    throw ApiErrorHandler.toUIError(err);
  }
}
