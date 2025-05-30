import { connect } from '@/dbConfig/dbConfig';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import MiddlewareFeatures from '@/middlewareFeatures';
import { Emails } from '@/utils/email-resend';
// import { Emails } from '@/utils/email-resend';

connect();

export async function POST(request: NextRequest) {
	const verify = new MiddlewareFeatures().verifyToken();
	try {
		//1) Protect route from none admin users
		if (!verify?.isAdminRole) {
			return NextResponse.json(
				{ error: 'User is not authorized' },
				{ status: 401 }
			);
		}
		//2) Get business details from admin user

		const adminUser = await User.findById(verify?.userId).populate([
			{
				path: 'business',
				select: 'businessName'
			}
		]);

		const body = await request.json();

		//3) Check if user with email exists
		if (
			await User.findOne({
				email: body.email
			})
		) {
			return NextResponse.json(
				{ error: 'User does exist' },
				{ status: 400 }
			);
		}

		//create the user but will be assigned a

		const user = await new User({
			email: body.email,
			business: adminUser.business.id,
			dateOfBirth: body.dateOfBirth,
			role: body.role,
			name: body.name,
			status: 'INVITED',
			businessName: adminUser.business.businessName
		});

		const inviteToken = user.createUserInviteToken();

		user.save({
			validateBeforeSave: false
		});

		console.log(user);
		let inviteURL =
			process.env.NODE_ENV === 'development'
				? `http://localhost:3000/auth/onboard-user/${inviteToken}`
				: `https://hotel-app-blush-beta.vercel.app/auth/onboard-user/${inviteToken}`;

		await new Emails(user, inviteURL, adminUser.business).sendInviteUser();

		//3) If everything is ok, send token to client

		// const token = signToken(user._id);
		const response = NextResponse.json({
			status: 'success',
			message: 'Invite sent to user',
			url: inviteURL
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
