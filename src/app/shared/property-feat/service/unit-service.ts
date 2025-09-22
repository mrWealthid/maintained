import axios from "axios";
import { ApiPaginatedResponse, ApiResponse } from "../../model/model";
import { API_ROUTES } from "../../routes/apiRoutes";
import { buildQueryString } from "@/utils/helpers";
import { ApiErrorHandler } from "@/utils/apiError";
import { Property } from "./property-service";

export interface Unit {
  _id: string;
  label: string;
  floor?: string;
  isActive: boolean;
  property: Property;
  tenantUser?: {
    _id: string;
    name: string;
    email: string;
  };
  tenantActive: boolean;
  tenants: Array<{
    user: string;
    start: string;
    end?: string;
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UnitListFilter {
  label?: string;
  property?: string;
  status?: string;
  tenant?: string;
}

export interface ListQueryParams<T> {
  limit?: number;
  page?: number;
  search?: T;
}

export async function fetchUnits<T>({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<UnitListFilter>): Promise<ApiPaginatedResponse<T[]>> {
  const queryString = buildQueryString({
    limit,
    page,
    ...search,
  });

  const url = `${API_ROUTES.propertyManagement.get_units}?${queryString}`;
  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function fetchUnitList<T>({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<UnitListFilter>): Promise<ApiPaginatedResponse<T[]>> {
  const queryString = buildQueryString({ limit, page, ...search });
  const url = `${API_ROUTES.propertyManagement.get_units}?${queryString}`;

  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function fetchUnitDetails(id: string): Promise<ApiResponse<Unit>> {
  const url = `${API_ROUTES.propertyManagement.unitById(id)}`;
  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function createUnit(data: Partial<Unit>) {
  try {
    const res = await axios.post(
      `${API_ROUTES.propertyManagement.get_units}`,
      data
    );
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function updateUnit(id: string, data: Partial<Unit>) {
  try {
    const res = await axios.patch(
      `${API_ROUTES.propertyManagement.unitById(id)}`,
      data
    );
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function deleteUnit(id: string) {
  try {
    const res = await axios.delete(
      `${API_ROUTES.propertyManagement.unitById(id)}`
    );
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
