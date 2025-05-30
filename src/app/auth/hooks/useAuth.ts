import { decode } from 'jsonwebtoken';
import { Router } from 'next/router';
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
import { handleClientErrorMessage } from '@/utils/helper';
import {
	ILogin,
	IRegister,
	IResetPassword,
	IToken,
	IUpdatePassword
} from '../model/model';

export function useLogin() {
	const router = useRouter();
	const {
		isPending: isLoading,
		mutate: login,
		data
	} = useMutation({
		mutationFn: (payload: ILogin) => handleLogin(payload),
		onError: (err: any) =>
			toast.error(handleClientErrorMessage(err.message)),
		onSuccess: (data) => {
			const userInfo = decode(data.token) as IToken;
			if (userInfo.role === 'USER') router.push('/dashboard');
			if (userInfo.role === 'ADMIN') router.push('/admin/dashboard');
		}
	});

	// console.log(data);
	return {
		isLoading,
		login,
		data
	};
}
export function useRegister() {
	const { isPending: isLoading, mutate: registering } = useMutation({
		mutationFn: (payload: IRegister) => handleRegister(payload),
		onError: (err: any) =>
			toast.error(handleClientErrorMessage(err.message))
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
export function useOnboardUser() {
	const { isPending: isLoading, mutate: onboardUser } = useMutation({
		mutationFn: (payload: any) => handleOnboardUser(payload),
		onSuccess: (data) => toast.success(data.message),
		onError: (err: any) => toast.error(err.message)
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
