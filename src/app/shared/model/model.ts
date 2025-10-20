import {
  INVITE_STATUS,
  ROLES,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "@/app/shared/enums/enums";
import { TechnicianRequest } from "../features/ticket-feat/model/ticket.model";
import { IUser } from "@/models/userModel";

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
  type: string;
  priority: TICKET_PRIORITY;
  propertyName: string;
  unitLabel: string;
}

export interface TicketDetails extends Ticket {
  requests: TechnicianRequest[];
}

export interface CreateTicketPayload
  extends Omit<
    Ticket,
    | "id"
    | "createdAt"
    | "id"
    | "category"
    | "user"
    | "status"
    | "priority"
    | "propertyName"
    | "unitLabel"
  > {
  status?: TICKET_STATUS;
  category: string;
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

export interface ITab {
  title: string;
  order: number;
  icon: React.ReactNode;
}

export interface ButtonGroupTabsProps<T = string> {
  handleClick: (type: TICKET_STATUS) => void;
  status: TICKET_STATUS;
  data: TabData<T>[];
}

interface TabData<T> {
  label: string;
  value: T;
}

export type Routes = {
  name: string;
  path: string;
  icon: React.ElementType;
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
  handleFilter?: (query: { status?: INVITE_STATUS } | null) => void;
};

export type UserFilterQuery = {
  status?: INVITE_STATUS;
};

export interface ManageUserFormProps {
  user?: User | undefined;
  membership?: Membership;
  onCloseModal?: () => void;
  successCallback?: (result?: User) => void;
  errorCallback?: (err: unknown) => void;
}

export interface ManageUserForm {
  name: string;
  email: string;
  role: ROLES;
  specialties: string[];
  propertyId: string;
  unitId: string;
}

export interface CreateUserPayload extends ManageUserForm {}

export interface CreateMultipleUsersPayload {
  users: CreateUserPayload[];
}

export interface CrumbLabelMap {
  [segment: string]: {
    label: string;
    // icon?: ReactNode; // Optional: if you want icons later
    hide?: boolean; // 🔍 used to omit from breadcrumbs
  };
}
