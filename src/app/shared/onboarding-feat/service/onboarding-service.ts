import { ApiErrorHandler } from "@/utils/apiError";
import axios from "axios";
import {
  ChecklistState,
  CreatePropertyPayload,
  CreateMultiplePropertiesPayload,
  CreateUnitPayload,
  Property,
} from "../model/model";
import { ApiResponse } from "../../model/model";
import { UnitOption } from "../components/PropertyUnitGroupArray";
import { ApiError } from "next/dist/server/api-utils";

export async function handleCreateProperty(payload: CreatePropertyPayload) {
  try {
    const res = await axios.post(`/api/properties`, payload);
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function handleCreateMultipleProperties(
  payload: CreateMultiplePropertiesPayload
) {
  try {
    const res = await axios.post(`/api/properties`, payload.properties);
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
export async function handleCreateUnits(payload: CreateUnitPayload) {
  try {
    const res = await axios.post(`/api/units/bulk`, payload);
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
export async function fetchProperties(): Promise<ApiResponse<Property[]>> {
  try {
    const res = await axios(`/api/properties`);
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function fetchUnits(propertyId: string): Promise<UnitOption[]> {
  try {
    const res = await axios(`/api/units?propertyId=${propertyId}`);
    return res.data.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function fetchOnboardingChecklist(): Promise<ChecklistState> {
  try {
    const res = await axios(`/api/onboarding/checklist`);
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
