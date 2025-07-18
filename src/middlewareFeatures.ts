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

	async tokenInfo() {
		const cookie = await cookies();
		return cookie.get('token');
	}

	constructor() {
		this.token = this.tokenInfo();
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

	async verifyToken() {
		const token = await this.token;
		if (!token?.value) return this;
		try {
			this.userInfo = jwt.verify(
				token.value,
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
