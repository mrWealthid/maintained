export type WorkspaceListFilter = {
  name?: string;
  email?: string;
  status?: "active" | "inactive";
  search?: string;
};

export type WorkspaceListRowDTO = {
  _id: string;
  id: string;
  name: string;
  email?: string;
  contact?: string;
  countryCode?: string;
  address?: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  creator?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  registrationId?: string;
  propertyCount: number;
  unitCount: number;
  ticketCount: number;
  memberCount: number;
};
