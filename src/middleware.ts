import { NextResponse, NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

export function middleware(request: NextRequest) {
	const url = request.nextUrl.clone();
	const currentPath = url.pathname;

	const token = request.cookies.get('token');
	const unprotectedRoute = currentPath.startsWith('/auth');
	const basePath = '/';

	const { valid, role } = verifyToken(token?.value || null);

	// No token and trying to access protected route
	if (!token && !unprotectedRoute) {
		const loginUrl = new URL('/auth/login', request.url);
		return NextResponse.redirect(loginUrl);
	}

	// Authenticated user accessing login or root page
	if (token && (unprotectedRoute || currentPath === basePath)) {
		const dashboardUrl = /ADMIN/.test(role || '')
			? new URL('/admin/dashboard', request.url)
			: new URL('/dashboard', request.url);
		return NextResponse.redirect(dashboardUrl);
	}

	// Invalid token on protected route
	if (!valid && !unprotectedRoute) {
		const loginUrl = new URL('/auth/login', request.url);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

// Define routes that this middleware applies to
export const config = {
	matcher: [
		'/',
		'/dashboard/:path*',
		'/admin/dashboard/:path*',
		'/auth/:path*'
	]
};

// Edge-safe token validation (no verification, just decode and check expiry)
function verifyToken(token: string | null): {
	valid: boolean;
	role: string | null;
} {
	if (!token) return { valid: false, role: null };
	try {
		const decoded = jwt.decode(token) as JwtPayload;
		if (!decoded?.exp) return { valid: false, role: null };
		return {
			valid: Date.now() < decoded.exp * 1000,
			role: decoded.role || null
		};
	} catch (err) {
		return { valid: false, role: null };
	}
}
