import { http } from "@/services/http";

import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import { buildQueryString } from "@/utils/helpers";

import type { TicketFormValues, TicketListQuery } from "../models/ticket-form.model";
import type { TicketStatus } from "../models/ticket-status.model";

/**
 * Canonical eventSphere-style service layer for tickets. All callers go
 * through `http`-equivalent (axios), all errors are normalised with
 * `ApiErrorHandler.toUIError` so consumers receive structured `UIError`
 * objects (issues, requestId, status, code) rather than flattened
 * strings.
 */

export async function fetchTicketList(query: TicketListQuery) {
  try {
    const qs = buildQueryString(query);
    const { data } = await http.get(
      `${API_ROUTES.ticketManagement.get_tickets}?${qs}`,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchTicketBySlug(slug: string) {
  try {
    const { data } = await http.get(
      API_ROUTES.ticketManagement.ticketBySlug(slug),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createTicket(payload: TicketFormValues) {
  try {
    const { data } = await http.post(
      API_ROUTES.ticketManagement.create_ticket,
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateTicket(slug: string, payload: Partial<TicketFormValues>) {
  try {
    const { data } = await http.patch(
      API_ROUTES.ticketManagement.ticketBySlug(slug),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteTicket(slug: string) {
  try {
    const { data } = await http.delete(
      API_ROUTES.ticketManagement.ticketBySlug(slug),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateTicketStatus(
  slug: string,
  payload: { status: TicketStatus; reason?: string },
) {
  try {
    const { data } = await http.put(
      API_ROUTES.ticketManagement.update_status(slug),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function assignTechnicianToTicket(
  slug: string,
  payload: { assignedTo: string },
) {
  try {
    const { data } = await http.patch(
      API_ROUTES.ticketManagement.assign_technician(slug),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
