import { ApiErrorHandler } from "@/utils/apiError";
import { http } from "@/services/http";
import {
  ChecklistState,
  CreatePropertyPayload,
  CreateMultiplePropertiesPayload,
  CreateUnitPayload,
  Property,
} from "../model/model";
import { ApiResponse } from "@/shared/model/model";
import { UnitOption } from "../components/PropertyUnitGroupArray";
import { ApiError } from "next/dist/server/api-utils";

export async function handleCreateProperty(payload: CreatePropertyPayload) {
  try {
    const res = await http.post(`/api/properties`, payload);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleCreateMultipleProperties(
  payload: CreateMultiplePropertiesPayload
) {
  try {
    const res = await http.post(`/api/properties`, payload.properties);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function handleCreateUnits(payload: CreateUnitPayload) {
  try {
    const res = await http.post(`/api/units/bulk`, payload);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
export async function fetchProperties(): Promise<ApiResponse<Property[]>> {
  try {
    const res = await http(`/api/properties`);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchUnits(propertyId: string): Promise<UnitOption[]> {
  try {
    const res = await http(`/api/units?propertyId=${propertyId}`);
    return res.data.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchOnboardingChecklist(): Promise<ChecklistState> {
  try {
    const res = await http(`/api/onboarding/checklist`);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
