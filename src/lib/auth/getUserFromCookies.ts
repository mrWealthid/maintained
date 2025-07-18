// utils/auth/getUserFromCookies.ts
import { cookies as getCookiesHeader } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './token';

/**
 * Reads the token from cookies and verifies it.
 * Automatically detects if it's running inside middleware or server context.
 * @param request Optional — only used in middleware (where headers.cookies doesn't work)
 */
export async function getUserFromCookies(request?: NextRequest): Promise<{
	id: string;
	role: TokenPayload['role'];
	isAdminRole: boolean;
	isUserRole: boolean;
	// isSuperAdminRole: boolean;
	isTechnicianRole: boolean;
} | null> {
	let token: string | undefined;

	if (request) {
		// Middleware case: use request.cookies
		token = request.cookies.get('token')?.value;
	} else {
		// Route handler/server component case
		const cookieStore = await getCookiesHeader();
		token = cookieStore.get('token')?.value;
	}

	if (!token) return null;

	const payload = verifyToken(token);
	if (!payload || (payload.exp && Date.now() > payload.exp * 1000)) {
		return null;
	}

	return {
		id: payload.id,
		role: payload.role,
		isAdminRole: payload.role === 'ADMIN',
		isUserRole: payload.role === 'USER',
		// isSuperAdminRole: payload.role === 'SUPER_ADMIN',
		isTechnicianRole: payload.role === 'TECHNICIAN'
	};
}
