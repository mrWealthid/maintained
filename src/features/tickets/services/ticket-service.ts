import { http } from "@/services/http";
import { ROLES, TECHNICIAN_RESPONSE, TICKET_STATUS } from "@/shared/enums/enums";
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
  TechnicianRequest,
  TicketDetailsResponse,
  TicketListFilter,
} from "../models/ticket.model";
import { buildQueryString } from "@/utils/helpers";
import { ApiErrorHandler } from "@/utils/apiError";
import { User } from "@/shared/model/model";

type TablePaginatedResponse<T> = ApiPaginatedResponse<T> & {
  summary: Record<string, number>;
};

function stripAllStatus<T extends { status?: unknown } | null | undefined>(
  search: T,
) {
  if (!search || typeof search !== "object") return search;

  if (
    search.status === TICKET_STATUS.all ||
    search.status === TECHNICIAN_RESPONSE.all ||
    search.status === "all"
  ) {
    const { status: _status, ...rest } = search;
    return rest as Omit<NonNullable<T>, "status">;
  }

  return search;
}

function withSummary<T>(
  response: ApiPaginatedResponse<T> & { summary?: Record<string, number> }
): TablePaginatedResponse<T> {
  return {
    ...response,
    summary: response.summary ?? {},
  };
}

export async function createTicket(
  data: CreateTicketPayload,
  isEditing: boolean,
  ticketSlug?: string
) {
  try {
    const res = ticketSlug
      ? await http.patch(
          `${API_ROUTES.ticketManagement.ticketBySlug(ticketSlug)}`,
          data
        )
      : await http.post(`${API_ROUTES.ticketManagement.create_ticket}`, data);

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
    const response = await http(url);

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
    const response = await http(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function fetchTicketDetails(
  ticketSlug: string
): Promise<ApiResponse<TicketDetailsResponse>> {
  const url = `${API_ROUTES.ticketManagement.ticketBySlug(ticketSlug)}`;
  try {
    const response = await http(url);
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
    const response = await http(url);
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
}: ListQueryParams<TicketListFilter>): Promise<TablePaginatedResponse<T[]>> {
  const queryString = buildQueryString({
    limit,
    page,
    ...stripAllStatus(search),
    ...(status !== TICKET_STATUS.all && { status }),
  });

  const url = `${API_ROUTES.ticketManagement.get_tickets}?${queryString}`;
  try {
    const response = await http(url);
    return withSummary(response.data);
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchTicketList({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<TicketListFilter>): Promise<
  TablePaginatedResponse<Ticket[]>
> {
  const queryString = buildQueryString({ limit, page, ...stripAllStatus(search) });
  const url = `${API_ROUTES.ticketManagement.get_tickets}?${queryString}`;

  try {
    const response = await http(url);
    return withSummary(response.data);
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function fetchRequestTicketList({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<TicketListFilter>): Promise<
  TablePaginatedResponse<TechnicianRequest[]>
> {
  const queryString = buildQueryString({ limit, page, ...stripAllStatus(search) });
  const url = `${API_ROUTES.ticketManagement.get_technician_requests}?${queryString}`;

  try {
    const response = await http(url);
    return withSummary(response.data);
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteTicket(ticketSlug: string) {
  try {
    const res = await http.delete(
      `${API_ROUTES.ticketManagement.ticketBySlug(ticketSlug)}`
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export type BulkTicketAction = "delete" | "decline";

export type BulkTicketActionPayload = {
  action: BulkTicketAction;
  ticketIds: string[];
};

export type BulkTicketActionResponse = {
  success: boolean;
  data: {
    action: BulkTicketAction;
    deletedCount?: number;
    modifiedCount?: number;
  };
};

export async function runBulkTicketAction(payload: BulkTicketActionPayload) {
  try {
    const { data } = await http.post<BulkTicketActionResponse>(
      API_ROUTES.ticketManagement.bulk_actions,
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function handOffTicket(
  ticketSlug: string,
  payload: { actionedBy: string }
) {
  try {
    const res = await http.patch(
      `${API_ROUTES.ticketManagement.actionedBy_ticket(ticketSlug)}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function ProcessTechnicianResponse(
  requestId: string,
  payload: ProcessRequest
) {
  try {
    const res = await http.patch(
      `${API_ROUTES.ticketManagement.process_technician_response(requestId)}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function assignTechnician(
  ticketSlug: string,
  payload: { assignedTo: string }
) {
  try {
    const res = await http.patch(
      `${API_ROUTES.ticketManagement.assign_technician(ticketSlug)}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function sendTechnicianRequest(
  ticketSlug: string,
  payload: SendTechnicianRequestPayload
) {
  try {
    const res = await http.post(
      `${API_ROUTES.ticketManagement.send_technician_request(ticketSlug)}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
