export interface NotificationPreferences {
  mode: "SMS" | "EMAIL" | "PHONE";
  smsEnabled: boolean;
  emailEnabled: boolean;
  phoneEnabled: boolean;
}

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passcode: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface TicketTypeFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface SettingsTab {
  id: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}
