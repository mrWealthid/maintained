import axios from "axios";
import { ROLES, TICKET_STATUS } from "@/shared/enums/enums";
import {
  ApiPaginatedResponse,
  ApiResponse,
  CreateTicketPayload,
  Ticket,
  TicketDetails,
} from "@/shared/model/model";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import {
  ListQueryParams,
  ProcessRequest,
  SendTechnicianRequestPayload,
  TicketDetailsResponse,
  TicketListFilter,
} from "../model/ticket.model";
import { buildQueryString } from "@/utils/helpers";
import { ApiErrorHandler } from "@/utils/apiError";
import { User } from "@/shared/model/model";

export async function createTicket(
  data: CreateTicketPayload,
  isEditing: boolean,
  requestId?: string
) {
  try {
    const res = requestId
      ? await axios.patch(
          `${API_ROUTES.ticketManagement.ticketById(requestId)}`,
          data
        )
      : await axios.post(`${API_ROUTES.ticketManagement.create_ticket}`, data);

    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchTicketCategory<T>(
  query?: string | null
): Promise<ApiResponse<T[]>> {
  const url = query
    ? `${API_ROUTES.ticketManagement.get_categories}?name=${query}`
    : `${API_ROUTES.ticketManagement.get_categories}`;
  try {
    const response = await axios(url);

    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function fetchRequestType<T>(): Promise<ApiResponse<T[]>> {
  const url = `${API_ROUTES.ticketManagement.get_request_types}`;
  try {
    const response = await axios(url);

    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function fetchTechnicians(
  query?: string | null
): Promise<ApiResponse<User[]>> {
  const url = query
    ? `${API_ROUTES.userManagement.get_users}?role=${ROLES.technician}&excludeInactive=true&name=${query}`
    : `${API_ROUTES.userManagement.get_users}?role=${ROLES.technician}&excludeInactive=true`;
  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function fetchTicketDetails(
  id: string
): Promise<ApiResponse<TicketDetailsResponse>> {
  const url = `${API_ROUTES.ticketManagement.ticketById(id)}`;
  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function fetchAdmins<T>(
  query?: string | null
): Promise<ApiResponse<T[]>> {
  const url = query
    ? `${API_ROUTES.userManagement.get_users}?role=${ROLES.admin}&excludeSelf=true&name=${query}`
    : `${API_ROUTES.userManagement.get_users}?role=${ROLES.admin}&excludeSelf=true`;
  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchTickets<T>({
  limit = 10,
  page = 1,
  search,
  status,
}: ListQueryParams<TicketListFilter>): Promise<ApiPaginatedResponse<T[]>> {
  const queryString = buildQueryString({
    limit,
    page,
    ...search,
    ...(status !== TICKET_STATUS.all && { status }),
  });

  const url = `${API_ROUTES.ticketManagement.get_tickets}?${queryString}`;
  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchTicketList<T>({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<TicketListFilter>): Promise<ApiPaginatedResponse<T[]>> {
  const queryString = buildQueryString({ limit, page, ...search });
  const url = `${API_ROUTES.ticketManagement.get_tickets}?${queryString}`;

  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function fetchRequestTicketList<T>({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<TicketListFilter>): Promise<ApiPaginatedResponse<T[]>> {
  const queryString = buildQueryString({ limit, page, ...search });
  const url = `${API_ROUTES.ticketManagement.get_technician_requests}?${queryString}`;

  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteTicket(id: string) {
  try {
    const res = await axios.delete(
      `${API_ROUTES.ticketManagement.ticketById(id)}`
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function assignTicket(
  id: string,
  payload: { actionedBy?: string; status: TICKET_STATUS }
) {
  try {
    const res = await axios.patch(
      `${API_ROUTES.ticketManagement.actionedBy_ticket(id)}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function handOffTicket(
  id: string,
  payload: { actionedBy: string }
) {
  try {
    const res = await axios.patch(
      `${API_ROUTES.ticketManagement.actionedBy_ticket(id)}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function ProcessTechnicianResponse(
  id: string,
  payload: ProcessRequest
) {
  try {
    const res = await axios.patch(
      `${API_ROUTES.ticketManagement.process_technician_response(id)}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function assignTechnician(
  id: string,
  payload: { assignedTo: string }
) {
  try {
    const res = await axios.patch(
      `${API_ROUTES.ticketManagement.assign_technician(id)}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function sendTechnicianRequest(
  id: string,
  payload: SendTechnicianRequestPayload
) {
  try {
    const res = await axios.post(
      `${API_ROUTES.ticketManagement.send_technician_request(id)}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
