"use client";

import { useQuery } from "@tanstack/react-query";

import { http } from "@/services/http";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import { ApiError } from "@/shared/model/model";
import { ApiErrorHandler } from "@/utils/apiError";
import {
  DEFAULT_PASSWORD_POLICY,
  type PasswordPolicy,
} from "@/lib/security/password-policy.shared";

async function fetchPasswordPolicyConfig() {
  try {
    const response = await http.get<{ status: string; data: PasswordPolicy }>(
      API_ROUTES.auth.passwordPolicyConfig,
    );
    return response.data.data;
  } catch (error: unknown) {
    throw ApiErrorHandler.toUIError(error);
  }
}

export function usePasswordPolicy() {
  return useQuery<PasswordPolicy, ApiError>({
    queryKey: ["password-policy-config"],
    queryFn: fetchPasswordPolicyConfig,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: DEFAULT_PASSWORD_POLICY,
  });
}
