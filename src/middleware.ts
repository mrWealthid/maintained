import jwt from 'jsonwebtoken';

// This is an example using TypeScript for Next.js middleware
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	// Accessing the cookie named "sessionId"

	const token = cookies().get('token');
	const loginPagePath = '/auth/login';
	const currentPath = new URL(request.url).pathname;
	// const sessionId = request.cookies.get('token');

	// You can then use this sessionId for authentication/authorization checks,
	// logging, or forwarding it as part of a request to an external service, etc.
	// console.log(`Session ID: ${sessionId}`);

	console.log(token);

	// if (!token && currentPath !== loginPagePath) {
	// 	const loginUrl = new URL('/auth/login', request.url);
	// 	return NextResponse.redirect(loginUrl);
	// }
	if (token) {
		// decodeToken(token.value);
	}

	// Continue with the request

	return NextResponse.next();
}
export const config = {
	matcher: [
		'/',
		'/dashboard/:path*',
		'/signup',
		'/auth/login',
		'/api/users'
		// '/^/api((?!/auth/(login|register))/?.*',
		// '/(^/api(/(?!auth/(login|register)))?.*$',
		// '/((?!api|auth/login|auth/register).*)',
		// '/((?!/api/auth/login|/api/auth/register)|/api))'

		// '/((?!api|_next/static|_next/image|favicon.ico).*)'
	]
};

// Function to decode the JWT token and extract the user role
function decodeToken(token: string | null): any {
	if (!token) return null;

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!);
		// Assuming the payload has a "role" field

		console.log(decoded);
		return decoded;
	} catch (error) {
		console.error('Token verification failed:', error);
		return null;
	}
}
