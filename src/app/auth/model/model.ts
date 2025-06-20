import { ROLES } from '@/app/shared/enums/enums';

export interface IUpdatePassword {
	newPassword: string;
	currentPassword: string;
	confirmNewPassword: string;
	resetToken: string;
}

export interface IResetPassword {
	email: string;
}

export interface ILogin {
	email: string;
	password: string;
}

export type LoginForm = ILogin;

export interface RegisterPayload {
	name: string;
	email: string;
	password: string;
	businessName: string;
	registrationId: string;
	businessContact: string;
	country: string;
	businessAddress: string;
	businessEmail: string;
}

export interface RegisterForm extends Omit<RegisterPayload, 'name'> {
	firstName: string;
	lastName: string;
}

export interface IRegister {
	name: string;
	email: string;
	password: string;
	role?: ROLES;
}
// export interface IBusiness {
// 	businessName: string;
// 	registrationId: string;
// 	businessEmail: string;
// 	businessContact: string;
// 	businessCreator: string;
// 	country: string;
// 	businessAddress: string;
// 	logo?: string;
// 	businessUsers?: Array<any>;
// }

export interface IToken {
	id: string;
	role: ROLES;
	iat: number;
	exp: number;
}

export interface OnboardUser {
	password: string;
	inviteToken: string;
}

export interface OnboardUserForm {
	password: string;
	dateOfBirth: string;
}
// password, inviteToken;
