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

export interface IRegister {
	name: string;
	email: string;
	password: string;
	role?: 'user' | 'admin';
}
export interface IBusiness {
	businessName: string;
	registrationId: string;
	businessEmail: string;
	businessContact: string;
	businessCreator: string;
	country: string;
	businessAddress: string;
	logo?: string;
	businessUsers?: Array<any>;
}

export interface IToken {
	id: string;
	role: 'ADMIN' | 'USER' | 'SUPER_ADMIN';
	iat: number;
	exp: number;
}
