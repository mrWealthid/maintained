"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiErrorHandler } from "@/utils/apiError";
import { TECHNICIAN_REQUEST_KEYS } from "../data/technician-request-data";
import type {
  TechnicianRequestCreateValues,
  TechnicianRequestListQuery,
  TechnicianResponseValues,
} from "../models/technician-request.model";
import {
  createTechnicianRequests,
  fetchTechnicianRequests,
  respondToTechnicianRequest,
} from "../services/technician-request-service";

export function useTechnicianRequests(query: TechnicianRequestListQuery) {
  return useQuery({
    queryKey: TECHNICIAN_REQUEST_KEYS.list(query),
    queryFn: () => fetchTechnicianRequests(query),
    placeholderData: (previous) => previous,
  });
}

export function useCreateTechnicianRequests(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TechnicianRequestCreateValues) =>
      createTechnicianRequests(ticketId, payload),
    onSuccess: () => {
      toast.success("Technician request sent");
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_REQUEST_KEYS.all });
    },
    onError: (err) => toast.error(ApiErrorHandler.extract(err).message),
  });
}

export function useRespondToTechnicianRequest(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TechnicianResponseValues) =>
      respondToTechnicianRequest(requestId, payload),
    onSuccess: () => {
      toast.success("Technician response saved");
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_REQUEST_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: TECHNICIAN_REQUEST_KEYS.byId(requestId),
      });
    },
    onError: (err) => toast.error(ApiErrorHandler.extract(err).message),
  });
}
