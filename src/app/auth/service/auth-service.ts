import { handleClientErrorMessage } from '@/utils/helper';
import axios from 'axios';
import {
	ILogin,
	IRegister,
	IResetPassword,
	IUpdatePassword,
	OnboardUser
} from '../model/model';

export async function handleLogin(payload: ILogin) {
	try {
		const res = await axios.post(`/api/auth/login`, payload);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Login could not be completed Status: ${err.response.status}`
			);
		}
		throw new Error('Login could not be completed');
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
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`User could not be registered Status: ${err.response.status}`
			);
		}
		throw new Error('User could not be registered');
	}
}
export async function handleForgetPassword(payload: IResetPassword) {
	try {
		const res = await axios.post(`/api/auth/forgotPassword`, payload);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`User could not be found Status: ${err.response.status}`
			);
		}
		throw new Error('User could not be found');
	}
}
export async function handleUpdatePassword(payload: IUpdatePassword) {
	try {
		const res = await axios.post(`/api/auth/updatePassword`, payload);

		const data = await res.data;

		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Password could not be updated Status: ${err.response.status}`
			);
		}
		throw new Error('Password could not be updated');
	}
}
export async function handleResetPassword(payload: IUpdatePassword) {
	try {
		const res = await axios.post(`/api/auth/resetPassword`, payload);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`Password could not be updated Status: ${err.response.status}`
			);
		}
		throw new Error('Password could not be updated');
	}
}
export async function handleOnboardUser(payload: OnboardUser) {
	try {
		const res = await axios.post(`/api/auth/onboard`, payload);
		const data = await res.data;
		return data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(
				`User could not be onboarded Status: ${err.response.status}`
			);
		}
		throw new Error('User could not be onboarded');
	}
}
export async function handleLogout() {
	try {
		await axios(`/api/auth/logout`);
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response) {
			throw new Error(`Logout failed : ${err.response.status}`);
		}
		throw new Error('Logout failed');
	}
}
