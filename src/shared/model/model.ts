import {
  INVITE_STATUS,
  ROLES,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "@/shared/enums/enums";
import type { ComponentType } from "react";
import { TechnicianRequest } from "../../features/tickets/models/ticket.model";
import { IUser } from "@/models/userModel";
import type { PermissionKey } from "@/shared/auth/permission-registry";

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: Date;
  business: string;
  isActive: boolean;
  isDefault: boolean;
}
export interface TicketType {
  name: string;
  description?: string;
  createdAt?: Date;
  id: string;
  isActive: boolean;
  isDefault: boolean;
  business: string;
}

export interface Ticket {
  title: string;
  description: string;
  status: TICKET_STATUS;
  id: string;
  createdAt: string;
  images?: string[];
  videos?: string[];
  documents?: string[];
  user: Pick<User, "id" | "name" | "email">;
  area: string;
  category: Category;

  assignedTo?: User;
  actionedBy?: Pick<User, "id" | "id" | "name">;
  relatedTo?:
    | string
    | Pick<Ticket, "id" | "title" | "status" | "createdAt">
    | null;
  type: string;
  priority: TICKET_PRIORITY;
  propertyName: string;
  unitLabel: string;
}

export interface TicketDetails extends Ticket {
  requests: TechnicianRequest[];
  attachments?: string[];
  files?: string[];
  media?: string[];
}

export interface CreateTicketPayload
  extends Omit<
    Ticket,
    | "id"
    | "createdAt"
    | "category"
    | "user"
    | "status"
    | "propertyName"
    | "unitLabel"
    | "relatedTo"
  > {
  status?: TICKET_STATUS;
  category: string;
  property?: string;
  unit?: string;
  relatedTo?: string | null;
}

export interface FileUploadPreview {
  id: number;
  url: string;
  type: string;
  file: File;
  uploadProgress: number;
}

export interface ApiError {
  message: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
export interface ApiPaginatedResponse<T> {
  status: string;
  message: string;
  data: T;
  totalRecords: number;
  results: number;
}

export type Routes = {
  name: string;
  path: string;
  icon: React.ElementType;
  permission?: PermissionKey;
};

//USER

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  currentBusiness: Pick<Business, "country" | "name" | "id">;
  createdAt?: Date;
  dateOfBirth?: Date;
  inviteToken?: string;
  memberships: Membership[];
  active?: boolean;
}

export interface Membership {
  business: { name: string; id: string };
  status?: INVITE_STATUS;
  specialties?: string[];
  role: ROLES;
  id: string;
  inviteExpired: boolean;
  isCreator: boolean;
}

//how to create a User interface without a populated response object

export interface UserResponse
  extends Omit<IUser, "currentBusiness" | "memberships"> {
  id: string;
  currentBusiness: string;
  memberships: {
    business: { name: string; id: string };
    status?: INVITE_STATUS;
    role: ROLES;
    id: string;
  }[];
}

export interface Business {
  id: string;
  name: string;
  registrationId: string;
  contact: string;
  country: string;
  address: string;
  description?: string;
  createdAt?: Date;
  email: string;
  creator: string;
  logo?: string;
}

export type UserRowActionsProps = {
  user: User;
  membership?: Membership;
};

export type UserRowProps = {
  data?: User[];
};

export type UserQueryprops = {
  onFilter?: (query: { status?: INVITE_STATUS } | null) => void;
};

export type UserFilterQuery = {
  status?: INVITE_STATUS;
};

export type BaseActions = {
  label: string;
  action: () => void;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "destructive";
};

export interface ConfirmActions
  extends Pick<BaseActions, "label" | "className" | "icon" | "variant"> {
  key: string;
}
