import { http } from "@/services/http";
import { ApiErrorHandler } from "@/utils/apiError";
import { API_ROUTES } from "@/shared/routes/apiRoutes";
import {
  InvitePreview,
  IResetPassword,
  IUpdatePassword,
  LoginPayload,
  OnboardUser,
  PasswordlessLoginConfig,
  PasswordlessLoginRequestPayload,
  SignupValues,
} from "../model/model";

export async function handleLogin(payload: LoginPayload) {
  try {
    const res = await http.post(API_ROUTES.auth.login, payload);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handlePasswordlessLoginRequest(
  payload: PasswordlessLoginRequestPayload,
) {
  try {
    const res = await http.post(
      API_ROUTES.auth.passwordlessRequest,
      payload,
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchPasswordlessLoginConfig() {
  try {
    const res = await http.get<{
      status: string;
      data: PasswordlessLoginConfig;
    }>(API_ROUTES.auth.passwordlessConfig);
    return res.data.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleRegister(payload: SignupValues) {
  try {
    const res = await http.post(API_ROUTES.auth.register, payload);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleForgetPassword(payload: IResetPassword) {
  try {
    const res = await http.post(API_ROUTES.auth.forgotPassword, payload);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleUpdatePassword(payload: IUpdatePassword) {
  try {
    const res = await http.post(API_ROUTES.auth.updatePassword, payload);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleResetPassword(payload: IUpdatePassword) {
  try {
    const res = await http.post(API_ROUTES.auth.resetPassword, payload);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleOnboardUser(payload: OnboardUser) {
  try {
    const res = await http.post(API_ROUTES.auth.onboard, payload);
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function fetchInvitePreview(inviteToken: string) {
  try {
    const res = await http.get<{ status: string; data: InvitePreview }>(
      `${API_ROUTES.auth.onboard}?inviteToken=${encodeURIComponent(inviteToken)}`,
    );
    return res.data;
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}

export async function handleLogout() {
  try {
    await http(API_ROUTES.auth.logout);
  } catch (err: unknown) {
    throw ApiErrorHandler.toUIError(err);
  }
}
