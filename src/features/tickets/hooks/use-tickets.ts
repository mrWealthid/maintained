"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiErrorHandler } from "@/utils/apiError";

import {
  assignTechnicianToTicket,
  createTicket,
  deleteTicket,
  fetchTicketById,
  fetchTicketList,
  updateTicket,
  updateTicketStatus,
} from "../services/tickets-service";
import type {
  TicketFormValues,
  TicketListQuery,
} from "../models/ticket-form.model";
import type { TicketStatus } from "../models/ticket-status.model";

/**
 * Typed query-key map for the tickets feature. All ticket-related cache
 * lookups and invalidations should go through this map so renames are
 * a single-file change.
 */
export const TICKET_KEYS = {
  all: ["tickets"] as const,
  list: (query: TicketListQuery) => ["tickets", "list", query] as const,
  byId: (id: string) => ["tickets", id] as const,
} as const;

export function useTicketList(query: TicketListQuery) {
  return useQuery({
    queryKey: TICKET_KEYS.list(query),
    queryFn: () => fetchTicketList(query),
    placeholderData: (previous) => previous,
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: id ? TICKET_KEYS.byId(id) : ["tickets", "noop"],
    queryFn: () => fetchTicketById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TicketFormValues) => createTicket(payload),
    onSuccess: () => {
      toast.success("Ticket created");
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
    },
    onError: (err) => {
      toast.error(ApiErrorHandler.extract(err).message);
    },
  });
}

export function useUpdateTicket(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<TicketFormValues>) =>
      updateTicket(id, payload),
    onSuccess: () => {
      toast.success("Ticket updated");
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
    },
    onError: (err) => {
      toast.error(ApiErrorHandler.extract(err).message);
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: () => {
      toast.success("Ticket deleted");
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
    },
    onError: (err) => {
      toast.error(ApiErrorHandler.extract(err).message);
    },
  });
}

export function useUpdateTicketStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { status: TicketStatus; reason?: string }) =>
      updateTicketStatus(id, payload),
    onSuccess: () => {
      toast.success("Ticket status updated");
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
    },
    onError: (err) => {
      toast.error(ApiErrorHandler.extract(err).message);
    },
  });
}

export function useAssignTechnician(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { assignedTo: string }) =>
      assignTechnicianToTicket(id, payload),
    onSuccess: () => {
      toast.success("Technician assigned");
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: TICKET_KEYS.all });
    },
    onError: (err) => {
      toast.error(ApiErrorHandler.extract(err).message);
    },
  });
}
