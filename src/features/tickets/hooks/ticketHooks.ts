import { toast } from "sonner";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  assignTechnician,
  createTicket,
  deleteTicket,
  fetchAdmins,
  fetchRequestType,
  fetchTechnicians,
  fetchTicketCategory,
  fetchTicketDetails,
  fetchTickets,
  handOffTicket,
  ProcessTechnicianResponse,
  runBulkTicketAction,
  sendTechnicianRequest,
} from "../services/ticket-service";
import {
  ListQueryParams,
  ProcessRequest,
  SendTechnicianRequestPayload,
  TicketListFilter,
  TicketStatus,
} from "../models/ticket.model";
import {
  Category,
  CreateTicketPayload,
  Ticket,
  TicketType,
  User,
} from "@/shared/model/model";
import { ApiError } from "@/shared/model/model";
import { IListResponse } from "@/shared/components/table/models/table.model";
import { TICKET_STATUS } from "@/shared/enums/enums";
import { getMembershipForBusiness } from "@/utils/helpers";

export function useCreateTicket(isEditing: boolean, ticketId?: string) {
  const queryClient = useQueryClient();
  const {
    isPending: isCreating,
    mutate: handleCreateTicket,
    error: createTicketError,
  } = useMutation({
    mutationFn: (payload: CreateTicketPayload) =>
      createTicket(payload, isEditing, ticketId),
    onSuccess: () => {
      toast.success(
        ` 🎉 Maintenance request successfully ${isEditing ? "updated" : "created"}...`
      );
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });

      // close();
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isCreating, handleCreateTicket, createTicketError };
}

export function useFetchTickets<T>(
  status: TICKET_STATUS,
  search: TicketListFilter,
  page: number = 1,
  limit: number = 10
) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["tickets", status, search],
    queryFn: () => fetchTickets<T>({ page, limit, status, search }),
    // placeholderData: keepPreviousData,
  });

  return {
    isLoading,
    error,
    isRefetching,
    ...data,
  };
}
export function useFetchTicketType<T>(page: number = 1, limit: number = 50) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["ticket-types"],
    queryFn: () => fetchRequestType<T>(),
  });

  return {
    isLoading,
    error,
    isRefetching,
    ...data,
  };
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  const {
    isPending: isDeleting,
    mutate: handleDeleteTicket,
    error: deleteTicketError,
  } = useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: () => {
      toast.success("🎉 Maintenance request successfully deleted");
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isDeleting, handleDeleteTicket, deleteTicketError };
}
export function useProcessTechnicianResponse(id: string, close?: () => void) {
  const queryClient = useQueryClient();
  const { isPending: isProcessing, mutate: processResponse } = useMutation({
    mutationFn: (payload: ProcessRequest) =>
      ProcessTechnicianResponse(id, payload),
    onSuccess: () => {
      toast.success("Ticket successfully updated");
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
      close?.();
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isProcessing, processResponse };
}
export function useAssignTechnician(id: string, close?: () => void) {
  const queryClient = useQueryClient();
  const { isPending: isAssigning, mutate: handleAssignTechnician } =
    useMutation({
      mutationFn: (payload: { assignedTo: string }) =>
        assignTechnician(id, payload),
      onSuccess: () => {
        toast.success("Ticket successfully assigned");
        queryClient.invalidateQueries({
          queryKey: ["tickets"],
        });
        close?.();
      },
      onError: (err: ApiError) => toast.error(err.message),
    });

  return { isAssigning, handleAssignTechnician };
}

export function useFetchTechnicians(page: number = 1, limit: number = 50) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["technicians"],
    queryFn: () => fetchTechnicians(),
    select({ data }) {
      return data.map((user) => ({
        ...user,
        membership: getMembershipForBusiness(user, user.currentBusiness.id),
      }));
    },
  });

  return {
    isLoading,
    error,
    isRefetching,
    data,
  };
}
export function useFetchTicketDetails(id: string) {
  return useQuery({
    queryKey: ["ticketDetails", id],
    queryFn: () => fetchTicketDetails(id),
    enabled: Boolean(id),
  });
}
export function useFetchAdmins<T>(page: number = 1, limit: number = 50) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchAdmins<T>(),
  });

  return {
    isLoading,
    error,
    isRefetching,
    ...data,
  };
}

export function useSendTechnicianRequest(id: string, close?: () => void) {
  const queryClient = useQueryClient();
  const { isPending: isSending, mutate: handleSendTechnicianRequest } =
    useMutation({
      mutationFn: (payload: SendTechnicianRequestPayload) =>
        sendTechnicianRequest(id, payload),
      onSuccess: () => {
        toast.success("Request sent successfully");
        queryClient.invalidateQueries({
          queryKey: ["tickets"],
        });
        close?.();
      },
      onError: (err: ApiError) => toast.error(err.message),
    });

  return { isSending, handleSendTechnicianRequest };
}

export function useHandOffTicket(id: string, close?: () => void) {
  const queryClient = useQueryClient();
  const { isPending: isUpdating, mutate: handleHandleOffTicket } = useMutation({
    mutationFn: (payload: { actionedBy: string }) => handOffTicket(id, payload),
    onSuccess: () => {
      toast.success("Ticket successfully assigned");
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
      close?.();
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return { isUpdating, handleHandleOffTicket };
}

export function useFetchCategories(page: number = 1, limit: number = 50) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchTicketCategory<Category>(),
    select(data) {
      return data.data.map((cat) => ({ label: cat.name, value: cat.id }));
    },
  });

  return {
    isLoading,
    error,
    isRefetching,
    data,
  };
}
export function useFetchRequestTypes(page: number = 1, limit: number = 50) {
  const { isLoading, data, error, isRefetching } = useQuery({
    queryKey: ["request-type"],
    queryFn: () => fetchRequestType<TicketType>(),
    select({ data }) {
      return data.map((type) => ({
        label: type.name,
        value: type.id,
      }));
    },
  });

  return {
    isLoading,
    error,
    isRefetching,
    data,
  };
}

export function useBulkTicketAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runBulkTicketAction,
    onSuccess: (res) => {
      const action = res.data.action;
      if (action === "delete") {
        const count = res.data.deletedCount ?? 0;
        toast.success(
          count > 0
            ? `${count} ticket${count === 1 ? "" : "s"} deleted.`
            : "No tickets were deleted.",
        );
      } else if (action === "decline") {
        const count = res.data.modifiedCount ?? 0;
        toast.success(
          count > 0
            ? `${count} ticket${count === 1 ? "" : "s"} declined.`
            : "No tickets were changed.",
        );
      }
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
