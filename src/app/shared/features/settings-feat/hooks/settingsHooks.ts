import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CategoryFormData,
  TicketTypeFormData,
  NotificationPreferences,
} from "../model/settings.model";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  changePassword,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from "../service/settings-service";
import { ApiError } from "@/app/shared/model/model";

// Notification Preferences Hooks
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: fetchNotificationPreferences,
    select: (data) => data.data,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      toast.success("Notification preferences updated successfully");
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Password Change Hook
export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Categories Hooks
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    select: (data) => data.data,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      updateCategory(id, data),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  const {
    mutate: handleDeleteCategory,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { handleDeleteCategory, isDeleting };
}

// Ticket Types Hooks
export function useTicketTypes() {
  return useQuery({
    queryKey: ["ticket-types"],
    queryFn: fetchTicketTypes,
    select: (data) => data.data,
  });
}

export function useCreateTicketType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicketType,
    onSuccess: () => {
      toast.success("Ticket type created successfully");
      queryClient.invalidateQueries({ queryKey: ["ticket-types"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTicketType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TicketTypeFormData }) =>
      updateTicketType(id, data),
    onSuccess: () => {
      toast.success("Ticket type updated successfully");
      queryClient.invalidateQueries({ queryKey: ["ticket-types"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTicketType() {
  const queryClient = useQueryClient();

  const {
    mutate: handleDeleteTicketType,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteTicketType,
    onSuccess: () => {
      toast.success("Ticket type deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["ticket-types"] });
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });

  return { handleDeleteTicketType, isDeleting };
}
