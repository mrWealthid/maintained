import axios from "axios";
import { ApiPaginatedResponse, ApiResponse } from "@/shared/model/model";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { buildQueryString } from "@/utils/helpers";
import { ApiErrorHandler } from "@/utils/apiError";

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
  search?: T;
}

export async function fetchProperties<T>({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<PropertyListFilter>): Promise<ApiPaginatedResponse<T[]>> {
  const queryString = buildQueryString({
    limit,
    page,
    ...search,
  });

  const url = `${API_ROUTES.propertyManagement.get_properties}?${queryString}`;
  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchPropertyList<T>({
  limit = 10,
  page = 1,
  search,
}: ListQueryParams<PropertyListFilter>): Promise<ApiPaginatedResponse<T[]>> {
  const queryString = buildQueryString({ limit, page, ...search });
  const url = `${API_ROUTES.propertyManagement.get_properties}?${queryString}`;

  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchPropertyDetails(
  id: string
): Promise<ApiResponse<Property>> {
  const url = `${API_ROUTES.propertyManagement.propertyById(id)}`;
  try {
    const response = await axios(url);
    return response.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createProperty(data: Partial<Property>) {
  try {
    const res = await axios.post(
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
    const res = await axios.patch(
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
    const res = await axios.delete(
      `${API_ROUTES.propertyManagement.propertyById(id)}`
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
