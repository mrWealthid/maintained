import { ApiErrorHandler } from "@/utils/apiError";
import { http } from "@/services/http";
import {
  OnboardingState,
  CreatePropertyPayload,
  CreateMultiplePropertiesPayload,
  CreateUnitPayload,
  Property,
} from "../model/model";
import { ApiResponse } from "@/shared/model/model";
import { UnitOption } from "../components/PropertyUnitGroupArray";

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

export async function fetchOnboardingState(): Promise<
  ApiResponse<OnboardingState>
> {
  try {
    const res = await http(`/api/onboarding/state`);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function completeOnboarding(): Promise<
  ApiResponse<{ onboardingCompletedAt: string }>
> {
  try {
    const res = await http.post(`/api/onboarding/complete`, {});
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
