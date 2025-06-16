import { connect } from '@/dbConfig/dbConfig';
import MiddlewareFeatures from '@/middlewareFeatures';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';

connect();

export async function GET(request: NextRequest) {
	try {
		const verify = new MiddlewareFeatures().verifyToken();

		if (!verify.isUserAuthenticated) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		const user = await User.findById(verify?.userId).populate([
			{
				path: 'business',
				select: 'businessName logo'
			}
		]);

		if (!user)
			NextResponse.json({ error: 'User not found' }, { status: 404 });

		const response = NextResponse.json(
			{
				status: 'success',
				data: user
			},
			{ status: 200 }
		);
		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
