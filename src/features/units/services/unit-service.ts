import { http } from "@/services/http";
import { ApiPaginatedResponse, ApiResponse } from "@/shared/model/model";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { buildQueryString } from "@/utils/helpers";
import { ApiErrorHandler } from "@/utils/apiError";
import { Property } from "@/features/properties/services/property-service";

type TablePaginatedResponse<T> = ApiPaginatedResponse<T> & {
  summary: Record<string, number>;
};

function withSummary<T>(
  response: ApiPaginatedResponse<T> & { summary?: Record<string, number> }
): TablePaginatedResponse<T> {
  return {
    ...response,
    summary: response.summary ?? {},
  };
}

export interface Unit {
  _id: string;
  id?: string;
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
    user: string | { _id?: string; id?: string; name?: string; email?: string };
    start: string;
    end?: string;
  }>;
  tags: string[];
  bedrooms?: number;
  bathrooms?: number;
  sizeSqft?: number;
  monthlyRent?: { amount?: number; currency?: string };
  notes?: string;
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
  search?: T | null;
}

export async function fetchUnits<T>({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<UnitListFilter>): Promise<TablePaginatedResponse<T[]>> {
  const queryString = buildQueryString({
    limit,
    page,
    ...search,
  });

  const url = `${API_ROUTES.propertyManagement.get_units}?${queryString}`;
  try {
    const response = await http(url);
    return withSummary(response.data);
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchUnitList({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<UnitListFilter>): Promise<TablePaginatedResponse<Unit[]>> {
  const queryString = buildQueryString({ limit, page, ...search });
  const url = `${API_ROUTES.propertyManagement.get_units}?${queryString}`;

  try {
    const response = await http(url);
    return withSummary(response.data);
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchUnitDetails(id: string): Promise<ApiResponse<Unit>> {
  const url = `${API_ROUTES.propertyManagement.unitById(id)}`;
  try {
    const response = await http(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createUnit(data: Partial<Unit>) {
  try {
    const res = await http.post(
      `${API_ROUTES.propertyManagement.get_units}`,
      data
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateUnit(id: string, data: Partial<Unit>) {
  try {
    const res = await http.patch(
      `${API_ROUTES.propertyManagement.unitById(id)}`,
      data
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteUnit(id: string) {
  try {
    const res = await http.delete(
      `${API_ROUTES.propertyManagement.unitById(id)}`
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
