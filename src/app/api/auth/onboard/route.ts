import { connect } from '@/dbConfig/dbConfig';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
// import { Emails } from '@/utils/email-resend';
import crypto from 'crypto';
import { INVITE_STATUS } from '@/app/shared/enums/enums';
import { Emails } from '@/utils/email-resend';

connect();

export async function POST(request: NextRequest) {
	const { password, inviteToken } = await request.json();

	try {
		// 1. Hash the invite token
		const hashedToken = crypto
			.createHash('sha256')
			.update(inviteToken)
			.digest('hex');

		// 2. Find the user who has a membership with that inviteToken
		const user = await User.findOne({
			memberships: {
				$elemMatch: {
					inviteToken: hashedToken,
					inviteTokenExpires: { $gt: Date.now() }
				}
			}
		}).select('+password');

		if (!user) {
			return NextResponse.json(
				{ error: 'Token is invalid or has expired' },
				{ status: 400 }
			);
		}

		// 3. Update password
		user.password = password;
		user.passwordConfirm = password;

		// 4. Activate the correct membership
		const membership = user.memberships.find(
			(m) =>
				m.inviteToken === hashedToken &&
				m.inviteTokenExpires &&
				m.inviteTokenExpires > new Date()
		);

		if (!membership) {
			return NextResponse.json(
				{ error: 'Matching membership not found' },
				{ status: 400 }
			);
		}

		membership.status = INVITE_STATUS.activated;
		membership.inviteToken = undefined;
		membership.inviteTokenExpires = undefined;

		// 5. Save user
		await user.save();

		return NextResponse.json({
			status: 'success',
			message: 'Password set and account activated'
		});
	} catch (error: any) {
		console.error('[ACTIVATE_INVITED_USER_ERROR]', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
