import { http } from "@/services/http";
import { ApiPaginatedResponse, ApiResponse } from "@/shared/model/model";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { buildQueryString } from "@/utils/helpers";
import { ApiErrorHandler } from "@/utils/apiError";

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

export const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
] as const;
export interface Property {
  _id: string;
  name: string;
  type: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: (typeof US_STATES)[number];
    postalCode: string;
    country: "United States";
    placeId?: string;
    lat?: number;
    lng?: number;
  };
  isActive: boolean;
  code?: string;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  units?: number;
  defaultUnit?: string | { _id?: string; id?: string; label?: string };
  yearBuilt?: number;
  amenities?: string[];
  photos?: string[];
  notes?: string;
}

export interface PropertyListFilter {
  name?: string;
  type?: string;
  city?: string;
  state?: string;
}

export interface ListQueryParams<T> {
  limit?: number;
  page?: number;
  search?: T | null;
}

export async function fetchProperties<T>({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<PropertyListFilter>): Promise<TablePaginatedResponse<T[]>> {
  const queryString = buildQueryString({
    limit,
    page,
    ...search,
  });

  const url = `${API_ROUTES.propertyManagement.get_properties}?${queryString}`;
  try {
    const response = await http(url);
    return withSummary(response.data);
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchPropertyList({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<PropertyListFilter>): Promise<
  TablePaginatedResponse<Property[]>
> {
  const queryString = buildQueryString({ limit, page, ...search });
  const url = `${API_ROUTES.propertyManagement.get_properties}?${queryString}`;

  try {
    const response = await http(url);
    return withSummary(response.data);
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchPropertyDetails(
  id: string
): Promise<ApiResponse<Property>> {
  const url = `${API_ROUTES.propertyManagement.propertyById(id)}`;
  try {
    const response = await http(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createProperty(data: Partial<Property>) {
  try {
    const res = await http.post(
      `${API_ROUTES.propertyManagement.get_properties}`,
      data
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateProperty(id: string, data: Partial<Property>) {
  try {
    const res = await http.patch(
      `${API_ROUTES.propertyManagement.propertyById(id)}`,
      data
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteProperty(id: string) {
  try {
    const res = await http.delete(
      `${API_ROUTES.propertyManagement.propertyById(id)}`
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
