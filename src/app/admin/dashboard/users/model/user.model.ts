import { INVITE_STATUS } from "@/shared/enums/enums";

export interface UserListFilter {
  title?: string;
  status?: INVITE_STATUS;
  createdAt?: string;
  user?: string;
  area?: string;
  category: string;
  id?: string;
}
