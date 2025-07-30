import { INVITE_STATUS } from '@/app/shared/enums/enums';
import { getUserFromCookies } from '@/lib/auth/getUserFromCookies';
import User from '@/model/userModel';
import { Emails } from '@/utils/email-resend';
import { generateInviteToken } from '@/utils/helpers';
import mongoose, { ObjectId, Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const verify = await getUserFromCookies();

	try {
		// 1) Ensure requester is admin
		if (!verify?.isAdminRole) {
			return NextResponse.json(
				{ error: 'User is not authorized' },
				{ status: 401 }
			);
		}

		const currentBusinessId = verify.currentBusiness;

		if (!currentBusinessId) {
			return NextResponse.json(
				{ error: 'No current business context' },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const capitalize = (str: string) =>
			str.replace(/\b\w/g, (char) => char.toUpperCase());

		const existingUser = await User.findOne({ email: body.email });

		let inviteToken = '';
		let userToInvite;

		const { token, hashed, expires } = generateInviteToken();

		console.log({ token, hashed });
		console.log({ existingUser });

		if (existingUser) {
			// Check if they're already a member of this business
			const alreadyMember = existingUser.memberships.some(
				(m) => m.business.toString() === currentBusinessId.toString()
			);

			if (alreadyMember) {
				return NextResponse.json(
					{ error: 'User already belongs to this business' },
					{ status: 400 }
				);
			}
			const businessObjectId = new mongoose.Types.ObjectId(
				currentBusinessId
			);

			// Append the new membership
			existingUser.memberships.push({
				business: businessObjectId,
				role: body.role,
				status: INVITE_STATUS.invited,
				inviteToken: hashed,
				inviteTokenExpires: expires
			});

			// Optional: only update currentBusiness if none is set
			if (!existingUser.currentBusiness) {
				existingUser.currentBusiness = businessObjectId;
			}

			// Refresh invite status and generate token
			// existingUser.status = INVITE_STATUS.invited;
			// inviteToken = existingUser.createUserInviteToken();
			await existingUser.save({ validateBeforeSave: false });

			userToInvite = existingUser;
		} else {
			// New user
			const newUser = new User({
				name: capitalize(body.name),
				email: body.email,
				dateOfBirth: body.dateOfBirth,
				memberships: [
					{
						business: currentBusinessId,
						role: body.role,
						status: INVITE_STATUS.invited,
						inviteToken: hashed,
						inviteTokenExpires: expires
					}
				],
				currentBusiness: currentBusinessId
			});

			inviteToken = newUser.createUserInviteToken();
			await newUser.save({ validateBeforeSave: false });

			userToInvite = newUser;
		}

		// Construct invite URL
		const inviteURL =
			process.env.NODE_ENV === 'development'
				? `${process.env.DEVELOPMENT_URL}/auth/onboard-user/${token}`
				: `${process.env.PRODUCTION_URL}/auth/onboard-user/${token}`;

		// Send invite email
		await new Emails(
			userToInvite,
			inviteURL,
			currentBusinessId
		).sendInviteUser();

		return NextResponse.json({
			status: 'success',
			message: 'Invite sent successfully',
			url: inviteURL
		});
	} catch (error: any) {
		console.error('[INVITE_USER_ERROR]', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
