import { handleClientErrorMessage } from '@/utils/helper';
import axios from 'axios';
import {
	ILogin,
	IRegister,
	IResetPassword,
	IUpdatePassword,
	OnboardUser
} from '../model/model';
import { ApiErrorHandler } from '@/utils/apiError';

export async function handleLogin(payload: ILogin) {
	try {
		const res = await axios.post(`/api/auth/login`, payload);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
// export async function handleCreateBusiness(payload: IBusiness) {
// 	try {
// 		const res = await axios.post(`/api/auth/business`, payload);
// 		const data = await res.data;
// 		return data;
// 	} catch (err: unknown) {
// 		if (axios.isAxiosError(err) && err.response) {
// 			throw new Error(
// 				`Business could not be created Status: ${err.response.status}`
// 			);
// 		}
// 		throw new Error('Business could not be created');
// 	}
// }
export async function handleRegister(payload: IRegister) {
	try {
		const res = await axios.post(`/api/auth/register`, payload);
		const data = await res.data;

		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
export async function handleForgetPassword(payload: IResetPassword) {
	try {
		const res = await axios.post(`/api/auth/forgotPassword`, payload);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
export async function handleUpdatePassword(payload: IUpdatePassword) {
	try {
		const res = await axios.post(`/api/auth/updatePassword`, payload);

		const data = await res.data;

		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
export async function handleResetPassword(payload: IUpdatePassword) {
	try {
		const res = await axios.post(`/api/auth/resetPassword`, payload);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		throw new Error(ApiErrorHandler.parse(err));
	}
}
export async function handleOnboardUser(payload: OnboardUser) {
	try {
		const res = await axios.post(`/api/auth/onboard`, payload);
		const data = await res.data;
		return data;
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
