import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

class MiddlewareFeatures {
	userInfo: any;
	private token;
	private isAuthenticated: boolean;
	private isAdmin: boolean;
	private isUser: boolean;
	private isSuperAdmin: boolean;
	private isTechnician: boolean;

	constructor() {
		this.token = cookies().get('token');
		this.userInfo = null;
		this.isAuthenticated = false;
		this.isAdmin = false;
		this.isUser = false;
		this.isSuperAdmin = false;
		this.isTechnician = false;
	}

	get isUserAuthenticated() {
		return this.isAuthenticated;
	}

	get isAdminRole() {
		return this.isAdmin;
	}
	get isUserRole() {
		return this.isUser;
	}
	get isSuperAdminRole() {
		return this.isSuperAdmin;
	}
	get isTechnicianRole() {
		return this.isTechnician;
	}

	get userId() {
		return this.userInfo?.id;
	}

	verifyToken() {
		if (!this.token?.value) return this;
		try {
			this.userInfo = jwt.verify(
				this.token.value,
				process.env.JWT_SECRET!
			);

			this.isAuthenticated = true;
			this.setRoleFlags();
		} catch {
			this.userInfo = null;
			this.isAuthenticated = false;
			this.isAdmin = false;
			this.isUser = false;
			this.isSuperAdmin = false;
			this.isTechnician = false;
		}
		return this;
	}

	private setRoleFlags() {
		const role = this.userInfo?.role || '';
		this.isAdmin = /ADMIN/.test(role);
		this.isUser = /USER/.test(role);
		this.isSuperAdmin = /SUPER_ADMIN/.test(role);
		this.isTechnician = /TECHNICIAN/.test(role);
	}
}

export default MiddlewareFeatures;
