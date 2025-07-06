import { connect } from '@/dbConfig/dbConfig';
import User from '@/model/userModel';
import Business from '@/model/businessModel';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ROLES } from '@/app/shared/enums/enums';
import TicketCategory from '@/model/ticketCategoryModel';

connect();

const signToken = (id: string, role: string) =>
	jwt.sign({ id, role }, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_EXPIRES_IN
	});

const createSendToken = (user: any, statusCode: number) => {
	const token = signToken(user._id, user.role);

	//Remove password from output
	user.password = undefined;
	const response = NextResponse.json(
		{
			status: 'success',
			token,
			data: {
				user
			}
		},
		{ status: statusCode }
	);
	const timeInMs = Number(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 1000; // 2 minutes in milliseconds
	const expires = new Date(Date.now() + timeInMs);
	response.cookies.set('token', token, {
		httpOnly: true,
		expires
	});

	return response;
};

export async function POST(request: Request) {
	try {
		const req = await request.json();
		console.log('Incoming Request:', req);

		// Check user existence
		const existingUser = await User.findOne({ email: req.email });
		if (existingUser) {
			return NextResponse.json(
				{ error: 'Email is already in use' },
				{ status: 400 }
			);
		}

		const business = await Business.create({
			businessName: req.businessName,
			registrationId: req.registrationId,
			businessContact: req.businessContact,
			country: req.country,
			businessAddress: req.businessAddress,
			businessEmail: req.businessEmail,
			businessCreator: req.name
		});

		if (!business) {
			return NextResponse.json(
				{ error: 'Business could not be created' },
				{ status: 404 }
			);
		}

		//create default categories
		const defaultCategories = await TicketCategory.find({
			isDefault: true
		});

		const cloned = defaultCategories.map((cat) => ({
			name: cat.name,
			description: cat.description,
			business: business._id
		}));

		await TicketCategory.insertMany(cloned);

		// Create User
		const newUser = await User.create({
			name: req.name,
			email: req.email,
			business: business.id,
			password: req.password,
			role: ROLES.admin
		});

		return createSendToken(newUser, 201);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Server error occurred' },
			{ status: 500 }
		);
	}
}
