import { decode } from 'jsonwebtoken';
import { useMutation } from '@tanstack/react-query';
import {
	handleForgetPassword,
	handleLogin,
	handleLogout,
	handleOnboardUser,
	handleRegister,
	handleResetPassword
} from '../service/auth-service';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';
import {
	ILogin,
	IRegister,
	IResetPassword,
	IToken,
	IUpdatePassword,
	OnboardUser
} from '../model/model';
import { ApiError } from 'next/dist/server/api-utils';
import { ROLES } from '@/shared/enums/enums';

export function useLogin() {
	const router = useRouter();
	const {
		isPending: isLoading,
		mutate: login,
		data
	} = useMutation({
		mutationFn: (payload: ILogin) => handleLogin(payload),
		onSuccess: (data) => {
			const userInfo = decode(data.token) as IToken;
			if (userInfo.role === ROLES.user) {
				router.push('/dashboard');
			} else if (userInfo.role === ROLES.admin) {
				router.push('/admin/dashboard');
			} else if (userInfo.role === ROLES.technician) {
				router.push('/technician/dashboard');
			}
		},
		onError: (err: ApiError) => toast.error(err.message)
	});

	return {
		isLoading,
		login,
		data
	};
}
export function useRegister() {
	const router = useRouter();
	const { isPending: isLoading, mutate: registering } = useMutation({
		mutationFn: (payload: IRegister) => handleRegister(payload),
		onSuccess: () => router.push('/admin/dashboard'),

		onError: (err: ApiError) => toast.error(err.message)
	});

	return {
		isLoading,
		registering
	};
}
export function useLogout(router: any) {
	const { isPending: isLoading, mutate: logOut } = useMutation({
		mutationFn: () => handleLogout(),
		onSuccess: () => router.push('/auth/login'),
		onError: (err: ApiError) => toast.error(err.message)
	});

	return {
		isLoading,
		logOut
	};
}
export function useResetPassword() {
	const { isPending: isLoading, mutate: resetPassword } = useMutation({
		mutationFn: (payload: IResetPassword) => handleForgetPassword(payload),
		onSuccess: (data) => toast.success(data.message),
		onError: (err: ApiError) => toast.error(err.message)
	});

	return {
		isLoading,
		resetPassword
	};
}
export function useUpdatePassword() {
	const { isPending: isLoading, mutate: updatePassword } = useMutation({
		mutationFn: (payload: IUpdatePassword) => handleResetPassword(payload),
		onSuccess: (data) => toast.success(data.message),
		onError: (err: ApiError) => toast.error(err.message)
	});

	return {
		isLoading,
		updatePassword
	};
}
export function useOnboardUser() {
	const { isPending: isLoading, mutate: onboardUser } = useMutation({
		mutationFn: (payload: OnboardUser) => handleOnboardUser(payload),
		onSuccess: (data) => toast.success(data.message),
		onError: (err: ApiError) => toast.error(err.message)
	});

	return {
		isLoading,
		onboardUser
	};
}

// const { isLoading, data, error } = useMutation({
// 	queryKey: ['auth'],
// 	queryFn: () => handleRegister(payload),

// 	onSuccess: () => {
// 		router.push('/dashboard');
// 	},
// 	onError: (err: any) => toast.error(err.message)
// });

// return {
// 	isLoading,
// 	error,
// 	data: data?.data
// };
