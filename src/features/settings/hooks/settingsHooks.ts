import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CategoryFormData,
  TicketTypeFormData,
  NotificationPreferences,
  EmailSettingsUpdateData,
} from "../models/settings.model";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  fetchEmailSettings,
  updateEmailSettings,
  changePassword,
  initiatePasswordChange,
  verifyPasscodeAndChangePassword,
  fetchSecuritySettings,
  fetchSecuritySessions,
  revokeOtherSecuritySessions,
  revokeSecuritySession,
  updateSecuritySettings,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchAppCategories,
  createAppCategory,
  updateAppCategory,
  deleteAppCategory,
  sendAppTestEmail,
  type SendAppTestEmailPayload,
  fetchTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  fetchAppTicketTypes,
  createAppTicketType,
  updateAppTicketType,
  deleteAppTicketType,
} from "../services/settings-service";
import { ApiError } from "@/shared/model/model";

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

export function useEmailSettings() {
  return useQuery({
    queryKey: ["email-settings"],
    queryFn: fetchEmailSettings,
    select: (data) => data.data,
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmailSettingsUpdateData) => updateEmailSettings(data),
    onSuccess: () => {
      toast.success("Email settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["email-settings"] });
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

// Step 1: Initiate password change and send passcode
export function useInitiatePasswordChange() {
  return useMutation({
    mutationFn: initiatePasswordChange,
    onSuccess: () => {
      toast.success("Verification passcode sent to your email");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Step 2: Verify passcode and complete password change
export function useVerifyPasscodeAndChangePassword() {
  return useMutation({
    mutationFn: verifyPasscodeAndChangePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: ["security-settings"],
    queryFn: fetchSecuritySettings,
    select: (data) => data.data,
  });
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSecuritySettings,
    onSuccess: () => {
      toast.success("Security settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSecuritySessions() {
  return useQuery({
    queryKey: ["security-sessions"],
    queryFn: fetchSecuritySessions,
    staleTime: 30_000,
  });
}

export function useRevokeSecuritySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSecuritySession,
    onSuccess: () => {
      toast.success("Session revoked");
      queryClient.invalidateQueries({ queryKey: ["security-sessions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRevokeOtherSecuritySessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeOtherSecuritySessions,
    onSuccess: () => {
      toast.success("Other sessions revoked");
      queryClient.invalidateQueries({ queryKey: ["security-sessions"] });
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

// Platform (app-wide) Categories Hooks
export function useAppCategories() {
  return useQuery({
    queryKey: ["app-categories"],
    queryFn: fetchAppCategories,
    select: (data) => data.data,
  });
}

export function useCreateAppCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAppCategory,
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["app-categories"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateAppCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      updateAppCategory(id, data),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["app-categories"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteAppCategory() {
  const queryClient = useQueryClient();
  const { mutate: handleDeleteAppCategory, isPending: isDeleting } = useMutation(
    {
      mutationFn: deleteAppCategory,
      onSuccess: () => {
        toast.success("Category deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["app-categories"] });
      },
      onError: (error: Error) => toast.error(error.message),
    },
  );
  return { handleDeleteAppCategory, isDeleting };
}

// App email — test send
export function useSendAppTestEmail() {
  return useMutation({
    mutationFn: (payload: SendAppTestEmailPayload) => sendAppTestEmail(payload),
  });
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

// Platform (app-wide) Ticket Types Hooks
export function useAppTicketTypes() {
  return useQuery({
    queryKey: ["app-ticket-types"],
    queryFn: fetchAppTicketTypes,
    select: (data) => data.data,
  });
}

export function useCreateAppTicketType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAppTicketType,
    onSuccess: () => {
      toast.success("Ticket type created successfully");
      queryClient.invalidateQueries({ queryKey: ["app-ticket-types"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateAppTicketType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TicketTypeFormData }) =>
      updateAppTicketType(id, data),
    onSuccess: () => {
      toast.success("Ticket type updated successfully");
      queryClient.invalidateQueries({ queryKey: ["app-ticket-types"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteAppTicketType() {
  const queryClient = useQueryClient();
  const { mutate: handleDeleteAppTicketType, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteAppTicketType,
      onSuccess: () => {
        toast.success("Ticket type deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["app-ticket-types"] });
      },
      onError: (error: ApiError) => toast.error(error.message),
    });
  return { handleDeleteAppTicketType, isDeleting };
}
