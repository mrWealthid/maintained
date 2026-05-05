import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { ApiError } from "@/shared/model/model";
import {
  fetchInvitePreview,
  fetchPasswordlessLoginConfig,
  handleForgetPassword,
  handleLogin,
  handleLogout,
  handleOnboardUser,
  handlePasswordlessLoginRequest,
  handleRegister,
  handleResetPassword,
} from "../service/auth-service";
import {
  IResetPassword,
  IUpdatePassword,
  LoginPayload,
  OnboardUser,
  PasswordlessLoginRequestPayload,
  RegisterPayload,
} from "../model/model";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: LoginPayload) => handleLogin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.refresh();
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return {
    isLoading: mutation.isPending,
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    data: mutation.data,
  };
}

export function usePasswordlessLoginRequest() {
  const mutation = useMutation({
    mutationFn: (payload: PasswordlessLoginRequestPayload) =>
      handlePasswordlessLoginRequest(payload),
    onError: (err: ApiError) => toast.error(err.message),
  });

  return {
    isLoading: mutation.isPending,
    requestLink: mutation.mutate,
    requestLinkAsync: mutation.mutateAsync,
    data: mutation.data,
  };
}

export function usePasswordlessLoginConfig() {
  return useQuery({
    queryKey: ["auth", "passwordless", "config"],
    queryFn: fetchPasswordlessLoginConfig,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function useInvitePreview(inviteToken: string | undefined | null) {
  return useQuery({
    queryKey: ["auth", "invite-preview", inviteToken],
    queryFn: () => fetchInvitePreview(inviteToken!),
    enabled: Boolean(inviteToken),
    staleTime: 60 * 1000,
    retry: false,
  });
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
      router.refresh();
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
  const { isPending: isLoading, mutate: updatePassword } = useMutation({
    mutationFn: (payload: IUpdatePassword) => handleResetPassword(payload),
    onSuccess: (data) => toast.success(data.message),
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
