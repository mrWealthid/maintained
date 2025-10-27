import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  handleForgetPassword,
  handleLogin,
  handleLogout,
  handleOnboardUser,
  handleRegister,
  handleResetPassword,
} from "../service/auth-service";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";
import {
  IResetPassword,
  IToken,
  IUpdatePassword,
  LoginPayload,
  OnboardUser,
  RegisterPayload,
} from "../model/model";
import { ApiError } from "next/dist/server/api-utils";
import { useState } from "react";
import axios from "axios";
import { API_ROUTES } from "@/app/shared/routes/apiRoutes";
import { User } from "@/app/shared/model/model";
import { NextRouter } from "next/router";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// export function useLogins(): {
//   handleLogins: ({
//     email,
//     password,
//   }: {
//     email: string;
//     password: string;
//   }) => void;
//   isLoading: boolean;
//   data: User | null;
//   error: string | null;
// } {
//   const [isLoading, setIsLoading] = useState(false);
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);

//   async function handleLogins(payload: { email: string; password: string }) {
//     try {
//       setIsLoading(true);
//       const response = await axios.post(`${API_ROUTES.auth.login}`, payload);

//       setIsLoading(false);
//       setData(response.data);
//       console.log("I fetched", response.data);
//     } catch (err: any) {
//       setIsLoading(false);
//       setError(err);
//       console.log(err);
//     }
//   }

//   return { handleLogins, isLoading, data, error };
// }

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    isPending: isLoading,
    mutate: login,
    data,
  } = useMutation({
    mutationFn: (payload: LoginPayload) => handleLogin(payload),
    onSuccess: () => {
      console.time("start");
      router.refresh();
      console.timeEnd("start");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return {
    isLoading,
    login,
    data,
  };
}
export function useRegister() {
  const router = useRouter();
  const { isPending: isLoading, mutate: registering } = useMutation({
    mutationFn: (payload: RegisterPayload) => handleRegister(payload),
    onSuccess: () => router.refresh(),
    onError: (err: ApiError) => toast.error(err.message),
  });

  return {
    isLoading,
    registering,
  };
}
export function useLogout(router: AppRouterInstance) {
  const queryClient = useQueryClient();
  const { isPending: isLoading, mutate: logOut } = useMutation({
    mutationFn: () => handleLogout(),
    onSuccess: () => {
      queryClient.clear();
      router.push("/auth/login");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return {
    isLoading,
    logOut,
  };
}
export function useResetPassword() {
  const { isPending: isLoading, mutate: resetPassword } = useMutation({
    mutationFn: (payload: IResetPassword) => handleForgetPassword(payload),
    onSuccess: (data) => toast.success(data.message),
    onError: (err: ApiError) => toast.error(err.message),
  });

  return {
    isLoading,
    resetPassword,
  };
}
export function useUpdatePassword() {
  const router = useRouter();
  const { isPending: isLoading, mutate: updatePassword } = useMutation({
    mutationFn: (payload: IUpdatePassword) => handleResetPassword(payload),
    onSuccess: (data) => {
      // router.refresh();
      toast.success(data.message);
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return {
    isLoading,
    updatePassword,
  };
}
export function useOnboardUser() {
  const { isPending: isLoading, mutate: onboardUser } = useMutation({
    mutationFn: (payload: OnboardUser) => handleOnboardUser(payload),
    onSuccess: (data) => toast.success(data.message),
    onError: (err: ApiError) => toast.error(err.message),
  });

  return {
    isLoading,
    onboardUser,
  };
}
