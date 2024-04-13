import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

class MiddlewareFeatures {
	userInfo: any;
	private token;
	private isAuthenticated: boolean;

	constructor() {
		this.token = cookies().get('token');
		this.userInfo = null;
		this.isAuthenticated = false;
	}

	// getRoleType() {
	// 	console.log(this.userInfo?.role);
	// 	this.isAdmin = /ADMIN/.test(this.userInfo?.role);
	// 	this.isUser = /USER/.test(this.userInfo?.role);
	// 	this.isSuperAdmin = /SUPER_ADMIN/.test(this.userInfo?.role);
	// 	return this;
	// }

	get isUserAuthenticated() {
		return this.isAuthenticated;
	}

	get isAdminRole() {
		return /ADMIN/.test(this.userInfo?.role);
	}
	get isUserRole() {
		return /USER/.test(this.userInfo?.role);
	}
	get isSuperAdminRole() {
		return /SUPER_ADMIN/.test(this.userInfo?.role);
	}

	get userId() {
		return this.userInfo.id;
	}

	verifyToken() {
		if (!this.token) return;
		try {
			this.userInfo = jwt.verify(
				this.token.value,
				process.env.JWT_SECRET!
			);

			this.isAuthenticated = true;
		} catch (e) {
			this.userInfo = null;
			this.isAuthenticated = false;
		}
		return this;
	}
}

export default MiddlewareFeatures;
