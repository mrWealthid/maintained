import axios from "axios";

import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import { buildQueryString } from "@/utils/helpers";

import type {
  PropertyFormValues,
  PropertyListQuery,
} from "../models/property-form.model";

export async function fetchPropertyList(query: PropertyListQuery) {
  try {
    const qs = buildQueryString(query);
    const { data } = await axios.get(
      `${API_ROUTES.propertyManagement.get_properties}?${qs}`,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchPropertyById(id: string) {
  try {
    const { data } = await axios.get(
      API_ROUTES.propertyManagement.propertyById(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createProperty(payload: PropertyFormValues) {
  try {
    const { data } = await axios.post(
      API_ROUTES.propertyManagement.get_properties,
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateProperty(
  id: string,
  payload: Partial<PropertyFormValues>,
) {
  try {
    const { data } = await axios.patch(
      API_ROUTES.propertyManagement.propertyById(id),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteProperty(id: string) {
  try {
    const { data } = await axios.delete(
      API_ROUTES.propertyManagement.propertyById(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
