import { http } from "@/services/http";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import type {
  TechnicianRequestCreateValues,
  TechnicianRequestListQuery,
  TechnicianResponseValues,
} from "../models/technician-request.model";

function queryString(query: Record<string, unknown>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export async function fetchTechnicianRequests(
  query: TechnicianRequestListQuery,
) {
  try {
    const qs = queryString(query);
    const response = await http.get(
      qs
        ? `${API_ROUTES.ticketManagement.get_technician_requests}?${qs}`
        : API_ROUTES.ticketManagement.get_technician_requests,
    );
    return response.data;
  } catch (err) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createTechnicianRequests(
  ticketId: string,
  payload: TechnicianRequestCreateValues,
) {
  try {
    const response = await http.post(
      API_ROUTES.ticketManagement.send_technician_request(ticketId),
      payload,
    );
    return response.data;
  } catch (err) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function respondToTechnicianRequest(
  requestId: string,
  payload: TechnicianResponseValues,
) {
  try {
    const response = await http.patch(
      API_ROUTES.ticketManagement.process_technician_response(requestId),
      payload,
    );
    return response.data;
  } catch (err) {
    throw ApiErrorHandler.toUIError(err);
  }
}
