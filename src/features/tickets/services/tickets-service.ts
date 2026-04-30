import axios from "axios";

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
    const { data } = await axios.get(
      `${API_ROUTES.ticketManagement.get_tickets}?${qs}`,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchTicketById(id: string) {
  try {
    const { data } = await axios.get(
      API_ROUTES.ticketManagement.ticketById(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createTicket(payload: TicketFormValues) {
  try {
    const { data } = await axios.post(
      API_ROUTES.ticketManagement.create_ticket,
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateTicket(id: string, payload: Partial<TicketFormValues>) {
  try {
    const { data } = await axios.patch(
      API_ROUTES.ticketManagement.ticketById(id),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteTicket(id: string) {
  try {
    const { data } = await axios.delete(
      API_ROUTES.ticketManagement.ticketById(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateTicketStatus(
  id: string,
  payload: { status: TicketStatus; reason?: string },
) {
  try {
    const { data } = await axios.put(
      API_ROUTES.ticketManagement.update_status(id),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function assignTechnicianToTicket(
  id: string,
  payload: { assignedTo: string },
) {
  try {
    const { data } = await axios.patch(
      API_ROUTES.ticketManagement.assign_technician(id),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
