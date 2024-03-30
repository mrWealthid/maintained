import { Router } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import {
	handleForgetPassword,
	handleLogin,
	handleLogout,
	handleRegister,
	handleResetPassword
} from '../service/auth-service';

import toast from 'react-hot-toast';
import { handleClientErrorMessage } from '@/utils/helper';
import {
	ILogin,
	IRegister,
	IResetPassword,
	IUpdatePassword
} from '../model/model';

export function useLogin() {
	const { isPending: isLoading, mutate: login } = useMutation({
		mutationFn: (payload: ILogin) => handleLogin(payload),
		onError: (err: any) => toast.error(err.message)
	});

	return {
		isLoading,
		login
	};
}
export function useRegister() {
	const { isPending: isLoading, mutate: registering } = useMutation({
		mutationFn: (payload: IRegister) => handleRegister(payload),

		onError: (err: any) => toast.error(err.message)
	});

	return {
		isLoading,
		registering
	};
}
export function useLogout(router: any) {
	const { isPending: isLoading, mutate: loggingOut } = useMutation({
		mutationFn: () => handleLogout(),
		onSuccess: () => router.push('/auth/login'),
		onError: (err: any) => toast.error(handleClientErrorMessage(err))
	});

	return {
		isLoading,
		loggingOut
	};
}
export function useResetPassword() {
	const { isPending: isLoading, mutate: resetPassword } = useMutation({
		mutationFn: (payload: IResetPassword) => handleForgetPassword(payload),
		onSuccess: (data) => toast.success(data.message),
		onError: (err: any) => toast.error(handleClientErrorMessage(err))
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
		onError: (err: any) => toast.error(err.message)
	});

	return {
		isLoading,
		updatePassword
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
