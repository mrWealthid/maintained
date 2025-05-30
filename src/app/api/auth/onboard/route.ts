import { connect } from '@/dbConfig/dbConfig';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
// import { Emails } from '@/utils/email-resend';
import crypto from 'crypto';

connect();

export async function POST(request: NextRequest) {
	const { password, inviteToken } = await request.json();
	try {
		const hashedToken = crypto
			.createHash('sha256')
			.update(inviteToken)
			.digest('hex');

		console.log({ hashedToken });

		const user = await User.findOne({
			inviteToken: hashedToken,
			inviteTokenExpires: { $gt: Date.now() }
		}).select('+password');

		console.log(user);
		//2) If token has not expired and there is a user, set the new password
		if (!user) {
			return NextResponse.json(
				{ error: 'Token is invalid or has expired' },
				{ status: 400 }
			);
		}
		user.password = password;
		user.passwordConfirm = password;
		user.status = undefined;
		user.inviteToken = undefined;
		user.inviteTokenExpires = undefined;
		await user.save();

		// const token = signToken(user._id);
		const response = NextResponse.json({
			status: 'success',
			message: 'New User onboarded sucessfully, Kindly Login',
			data: user
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
