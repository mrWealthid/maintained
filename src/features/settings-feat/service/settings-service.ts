import axios from "axios";
import { ApiResponse } from "@/shared/model/model";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import {
  CategoryFormData,
  TicketTypeFormData,
  NotificationPreferences,
  SecuritySettings,
  BusinessEmailSettings,
  EmailSettingsUpdateData,
} from "../model/settings.model";
import { Category, TicketType } from "@/shared/model/model";

// Notification Preferences
export async function fetchNotificationPreferences(): Promise<
  ApiResponse<NotificationPreferences>
> {
  try {
    const response = await axios.get(
      API_ROUTES.userManagement.notification_preferences
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<ApiResponse<NotificationPreferences>> {
  try {
    const response = await axios.put(
      API_ROUTES.userManagement.notification_preferences,
      preferences
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchEmailSettings(): Promise<
  ApiResponse<BusinessEmailSettings>
> {
  try {
    const response = await axios.get(API_ROUTES.settings.email);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateEmailSettings(
  settings: EmailSettingsUpdateData
): Promise<ApiResponse<BusinessEmailSettings>> {
  try {
    const response = await axios.put(API_ROUTES.settings.email, settings);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

// Password Change - Step 1: Initiate password change
export async function initiatePasswordChange(
  data: Omit<SecuritySettings, "confirmPassword" | "passcode">
): Promise<ApiResponse<void>> {
  try {
    const response = await axios.post(
      API_ROUTES.userManagement.change_password,
      data
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

// Password Change - Step 2: Verify passcode and complete password change
export async function verifyPasscodeAndChangePassword(data: {
  passcode: string;
  newPassword: string;
}): Promise<ApiResponse<void>> {
  try {
    const response = await axios.put(
      API_ROUTES.userManagement.change_password,
      data
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

// Legacy function kept for backward compatibility
export async function changePassword(
  data: Omit<SecuritySettings, "confirmPassword">
): Promise<ApiResponse<void>> {
  try {
    const response = await axios.post(
      API_ROUTES.userManagement.change_password,
      data
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

// Categories
export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const response = await axios.get(
      API_ROUTES.ticketManagement.get_categories
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createCategory(
  data: CategoryFormData
): Promise<ApiResponse<Category>> {
  try {
    const response = await axios.post(
      API_ROUTES.ticketManagement.get_categories,
      data
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<ApiResponse<Category>> {
  try {
    const response = await axios.put(
      `${API_ROUTES.ticketManagement.get_categories}/${id}`,
      data
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await axios.delete(
      `${API_ROUTES.ticketManagement.get_categories}/${id}`
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

// Ticket Types
export async function fetchTicketTypes(): Promise<ApiResponse<TicketType[]>> {
  try {
    const response = await axios.get(
      API_ROUTES.ticketManagement.get_request_types
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createTicketType(
  data: TicketTypeFormData
): Promise<ApiResponse<TicketType>> {
  try {
    const response = await axios.post(
      API_ROUTES.ticketManagement.get_request_types,
      data
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateTicketType(
  id: string,
  data: TicketTypeFormData
): Promise<ApiResponse<TicketType>> {
  try {
    const response = await axios.put(
      `${API_ROUTES.ticketManagement.get_request_types}/${id}`,
      data
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteTicketType(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await axios.delete(
      `${API_ROUTES.ticketManagement.get_request_types}/${id}`
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
