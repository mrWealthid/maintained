import { http } from "@/services/http";
import { ApiResponse } from "@/shared/model/model";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import {
  CategoryFormData,
  TicketTypeFormData,
  NotificationPreferences,
  PersonalProfileSettings,
  SecuritySettings,
  BusinessEmailSettings,
  EmailSettingsUpdateData,
  SecuritySessionSummary,
  WorkspaceSecuritySettings,
  WorkspaceProfileSettings,
  DeepPartial,
} from "../models/settings.model";
import { Category, TicketType } from "@/shared/model/model";

export async function fetchPersonalProfile(): Promise<
  ApiResponse<PersonalProfileSettings>
> {
  try {
    const response = await http.get(API_ROUTES.userManagement.get_user);
    const user = response.data.data;
    return {
      status: response.data.status,
      message: response.data.message ?? "",
      data: {
        name: user.name ?? "",
        email: user.email ?? "",
        contact: user.contact ?? "",
        countryCode: user.countryCode ?? "",
      },
    };
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updatePersonalProfile(
  profile: Omit<PersonalProfileSettings, "email">,
): Promise<ApiResponse<PersonalProfileSettings>> {
  try {
    const response = await http.put(API_ROUTES.userManagement.get_user, profile);
    const user = response.data.data;
    return {
      status: response.data.status,
      message: response.data.message ?? "",
      data: {
        name: user.name ?? "",
        email: user.email ?? "",
        contact: user.contact ?? "",
        countryCode: user.countryCode ?? "",
      },
    };
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchWorkspaceProfileSettings(): Promise<
  ApiResponse<WorkspaceProfileSettings>
> {
  try {
    const response = await http.get(API_ROUTES.settings.general);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateWorkspaceProfileSettings(
  payload: DeepPartial<WorkspaceProfileSettings>,
): Promise<ApiResponse<WorkspaceProfileSettings>> {
  try {
    const response = await http.patch(API_ROUTES.settings.general, payload);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

// Notification Preferences
export async function fetchNotificationPreferences(): Promise<
  ApiResponse<NotificationPreferences>
> {
  try {
    const response = await http.get(
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
    const response = await http.put(
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
    const response = await http.get(API_ROUTES.settings.email);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateEmailSettings(
  settings: EmailSettingsUpdateData
): Promise<ApiResponse<BusinessEmailSettings>> {
  try {
    const response = await http.put(API_ROUTES.settings.email, settings);
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
    const response = await http.post(
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
    const response = await http.put(
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
    const response = await http.post(
      API_ROUTES.userManagement.change_password,
      data
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchSecuritySettings(): Promise<
  ApiResponse<WorkspaceSecuritySettings>
> {
  try {
    const response = await http.get(API_ROUTES.settings.security);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateSecuritySettings(
  settings: WorkspaceSecuritySettings
): Promise<ApiResponse<WorkspaceSecuritySettings>> {
  try {
    const response = await http.put(API_ROUTES.settings.security, settings);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchSecuritySessions(): Promise<
  SecuritySessionSummary[]
> {
  try {
    const response = await http.get<{
      status: string;
      data: { sessions: SecuritySessionSummary[] };
    }>(API_ROUTES.dashboard.settings.securitySessions);
    return response.data.data.sessions;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function revokeSecuritySession(sessionId: string): Promise<void> {
  try {
    await http.delete(API_ROUTES.dashboard.settings.securitySessionById(sessionId));
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function revokeOtherSecuritySessions(): Promise<void> {
  try {
    await http.post(API_ROUTES.dashboard.settings.securitySessionsRevokeOthers);
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

// Categories
export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const response = await http.get(
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
    const response = await http.post(
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
    const response = await http.put(
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
    const response = await http.delete(
      `${API_ROUTES.ticketManagement.get_categories}/${id}`
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

// Platform-wide (app) categories
export async function fetchAppCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const response = await http.get(API_ROUTES.appSettings.categories);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createAppCategory(
  data: CategoryFormData
): Promise<ApiResponse<Category>> {
  try {
    const response = await http.post(API_ROUTES.appSettings.categories, data);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateAppCategory(
  id: string,
  data: CategoryFormData
): Promise<ApiResponse<Category>> {
  try {
    const response = await http.put(
      API_ROUTES.appSettings.categoryById(id),
      data
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export type SendAppTestEmailPayload = {
  templateKey: string;
  to: string;
  sender: {
    senderName?: string;
    senderEmail?: string;
    replyTo?: string;
    bcc?: string;
    footer?: string;
  };
  template: {
    subject: string;
    preheader: string;
    body: string;
    replyToOverride?: string;
  };
};

export async function sendAppTestEmail(
  payload: SendAppTestEmailPayload
): Promise<ApiResponse<{ messageId?: string }>> {
  try {
    const response = await http.post(API_ROUTES.appSettings.emailTest, payload);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteAppCategory(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(
      API_ROUTES.appSettings.categoryById(id)
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

// Ticket Types
export async function fetchTicketTypes(): Promise<ApiResponse<TicketType[]>> {
  try {
    const response = await http.get(
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
    const response = await http.post(
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
    const response = await http.put(
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
    const response = await http.delete(
      `${API_ROUTES.ticketManagement.get_request_types}/${id}`
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

// Platform-wide (app) ticket types
export async function fetchAppTicketTypes(): Promise<ApiResponse<TicketType[]>> {
  try {
    const response = await http.get(API_ROUTES.appSettings.ticketTypes);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createAppTicketType(
  data: TicketTypeFormData
): Promise<ApiResponse<TicketType>> {
  try {
    const response = await http.post(API_ROUTES.appSettings.ticketTypes, data);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateAppTicketType(
  id: string,
  data: TicketTypeFormData
): Promise<ApiResponse<TicketType>> {
  try {
    const response = await http.put(
      API_ROUTES.appSettings.ticketTypeById(id),
      data
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteAppTicketType(
  id: string
): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete(
      API_ROUTES.appSettings.ticketTypeById(id)
    );
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
