import MiddlewareFeatures from '@/middlewareFeatures';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { userId: string } }
) {
	try {
		const verify = new MiddlewareFeatures().verifyToken();

		if (!verify.isUserAuthenticated) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}
		if (!verify.isAdminRole) {
			return NextResponse.json(
				{ error: 'You are not Unauthorized to perform action' },
				{ status: 401 }
			);
		}

		const userId = params.userId;

		const user = await User.findByIdAndDelete(userId);

		if (!user) {
			return NextResponse.json(
				{ error: 'No user found with id' },
				{ status: 404 }
			);
		}
		const response = NextResponse.json({
			message: 'User deleted Successfully',
			success: true
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
