// import { NextRequest, NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';

// export function checkAuthorization(
// 	request: NextRequest,
// 	next: () => Promise<
// 		| NextResponse<{
// 				totalRecords: any;
// 				results: any;
// 				status: string;
// 				data: any;
// 		  }>
// 		| NextResponse<{
// 				error: any;
// 		  }>
// 	>
// ) {
// 	// const accessToken = request.headers.get('authorization')?.split(' ')[1];
// 	const token = cookies().get('token');

// 	if (!token || !jwt.verify(token.value, process.env.JWT_SECRET!)) {
// 		return NextResponse.json(
// 			{
// 				message: 'Unauthorized'
// 			},
// 			{
// 				status: 401
// 			}
// 		);
// 	}

// 	return next();
// }

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const AuthUser = async (req: any) => {
	const token = cookies().get('token');

	if (!token) return false;

	try {
		const extractAuthUserInfo = jwt.verify(
			token.value,
			process.env.JWT_SECRET!
		);

		console.log(extractAuthUserInfo);
		if (extractAuthUserInfo) return extractAuthUserInfo;
	} catch (e) {
		console.log(e);
		return false;
	}
};

export default AuthUser;
