import axios from "axios";

import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiErrorHandler } from "@/utils/apiError";
import { buildQueryString } from "@/utils/helpers";

import type {
  UnitFormValues,
  UnitListQuery,
} from "../models/unit-form.model";

export async function fetchUnitList(query: UnitListQuery) {
  try {
    const qs = buildQueryString(query);
    const { data } = await axios.get(
      `${API_ROUTES.propertyManagement.get_units}?${qs}`,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchUnitById(id: string) {
  try {
    const { data } = await axios.get(
      API_ROUTES.propertyManagement.unitById(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function createUnit(payload: UnitFormValues) {
  try {
    const { data } = await axios.post(
      API_ROUTES.propertyManagement.get_units,
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function updateUnit(
  id: string,
  payload: Partial<UnitFormValues>,
) {
  try {
    const { data } = await axios.patch(
      API_ROUTES.propertyManagement.unitById(id),
      payload,
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function deleteUnit(id: string) {
  try {
    const { data } = await axios.delete(
      API_ROUTES.propertyManagement.unitById(id),
    );
    return data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
