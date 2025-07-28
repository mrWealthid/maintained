import { connect } from '@/dbConfig/dbConfig';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';
import jwt, { SignOptions } from 'jsonwebtoken';
import { getRoleForBusiness } from '@/utils/helpers';
import { Types } from 'mongoose';
import { User as UserModel } from '@/app/shared/model/model';
import { INVITE_STATUS } from '@/app/shared/enums/enums';

connect();

const signTokenFromMembership = (user: any) => {
	console.log(user);
	// console.log({ memberships: user.memberships, id: user.currentBusiness });
	const role = getRoleForBusiness(user.memberships, user.currentBusiness);

	if (!role) {
		throw new Error('User is not a member of the specified business');
	}

	return jwt.sign(
		{ id: user._id, currentBusiness: user.currentBusiness, role },
		process.env.JWT_SECRET!,
		{ expiresIn: process.env.JWT_EXPIRES_IN } as SignOptions
	);
};

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();
		//1) Check if emails and password exists
		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Please provide email and password' },
				{ status: 400 }
			);
		}
		//2) Check if user exists & password is correct after it's hashed
		const user = await User.findOne({
			email
		}).select('+password');

		if (!user || !(await user.correctPassword(password, user.password))) {
			return NextResponse.json(
				{ error: 'Incorrect email or password' },
				{ status: 400 }
			);
		}

		//Email configuration

		// const data = await resend.emails.send({
		// 	from: 'support',
		// 	to: user.email,
		// 	subject: 'Password Reset',
		// 	text:
		// 	react:WaitlistEmail({ name: "Bu" })
		// });

		// resend.emails.send({
		// 	from: 'onboarding@resend.dev',
		// 	to: 'wealthiduwe@gmail.com',
		// 	subject: 'Hello World',

		// 	html: '<p>yeaaa</p>'
		// });

		// new Email(user, 'www.test.com').sendMyMail();
		// await new Emails(user, 'www.test.com').sendPasswordReset();
		// console.log(emails);

		//3) If everything is ok, send token to client

		console.log('login...', user);

		const token = signTokenFromMembership(user);

		const response = NextResponse.json({
			status: 'success',
			token
		});

		const timeInMs = Number(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 1000; // 2 minutes in milliseconds
		const expires = new Date(Date.now() + timeInMs);
		response.cookies.set('token', token, {
			httpOnly: true,
			expires
		});

		return response;
	} catch (error: any) {
		console.log(error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
