import { handleClientErrorMessage } from "@/utils/helper";
import axios from "axios";
import {
  IResetPassword,
  IUpdatePassword,
  LoginPayload,
  OnboardUser,
  RegisterPayload,
} from "../model/model";
import { ApiErrorHandler } from "@/utils/apiError";
import { API_ROUTES } from "@/app/shared/routes/apiRoutes";

export async function handleLogin(payload: LoginPayload) {
  try {
    const res = await axios.post(`${API_ROUTES.auth.login}`, payload);
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}

export async function handleRegister(payload: RegisterPayload) {
  try {
    const res = await axios.post(`/api/auth/register`, payload);
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
export async function handleForgetPassword(payload: IResetPassword) {
  try {
    const res = await axios.post(`/api/auth/forgotPassword`, payload);
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
export async function handleUpdatePassword(payload: IUpdatePassword) {
  try {
    const res = await axios.post(`/api/auth/updatePassword`, payload);

    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
export async function handleResetPassword(payload: IUpdatePassword) {
  try {
    const res = await axios.post(`/api/auth/resetPassword`, payload);
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
export async function handleOnboardUser(payload: OnboardUser) {
  try {
    const res = await axios.post(`/api/auth/onboard`, payload);
    return res.data;
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
export async function handleLogout() {
  try {
    await axios(`/api/auth/logout`);
  } catch (err: unknown) {
    throw new Error(ApiErrorHandler.parse(err));
  }
}
