import jwt, { JwtPayload } from 'jsonwebtoken';
// This is an example using TypeScript for Next.js middleware
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest, response: NextResponse) {
	const url = request.nextUrl.clone();
	const token = cookies().get('token') || null;

	const currentPath = new URL(request.url).pathname;

	const unprotectedRoute = url.pathname.startsWith('/auth');
	const basePath = '/';
	const { valid, role } = verifyToken(token?.value!);

	//if there is no token (user isn't authenticated) and visit is made to to protected routes
	if (!token && !unprotectedRoute) {
		const loginUrl = new URL('/auth/login', request.url);
		return NextResponse.redirect(loginUrl);
	}

	//If the logged in user tries to access the login page without logging out or visits the base path -- reroute to the dashboard
	if (token && (unprotectedRoute || currentPath === basePath)) {
		const dashboardUrl = /ADMIN/.test(role)
			? new URL('/admin/dashboard', request.url)
			: new URL('/dashboard', request.url);

		return NextResponse.redirect(dashboardUrl);
	}

	//  if there's a token kindly verify:: users with unverified token should be sent to login
	if (!valid && !unprotectedRoute) {
		const loginUrl = new URL('/auth/login', request.url);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}
export const config = {
	matcher: [
		'/',
		'/dashboard/:path*',
		'/admin/dashboard/:path*',
		'/auth/:path*'
	]
};

// Function to verify the JWT token
function verifyToken(token: string | null): any {
	if (!token) return { valid: false, role: null };

	const { exp, role } = jwt.decode(token) as JwtPayload;

	return { valid: Date.now() < exp! * 1000, role };
}
