import { eachYearOfInterval } from 'date-fns';
import { format } from 'date-fns/format';
import { NextRequest, NextResponse } from 'next/server';
import Category from '@/model/ticketCategoryModel';
import { connect } from '@/dbConfig/dbConfig';
import { mapToObject } from '@/utils/helpers';
import MiddlewareFeatures from '@/middlewareFeatures';
import User from '@/model/userModel';

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

		const user = await User.findById(verify.userId);
		if (!user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		const query: any = request.nextUrl.searchParams;

		const transformedQuery = mapToObject(query);

		const regex = new RegExp(transformedQuery.name, 'i'); // 'i' for case-insensitive

		await Category.find({
			$or: [
				{ business: user.business }, // business-specific
				{ isDefault: true } // system defaults
			],
			name: { $regex: regex }
		});
		const results = await Category.find({ name: { $regex: regex } });

		const response = NextResponse.json({
			status: 'success',
			data: results
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
export async function POST(request: NextRequest) {
	try {
		const verify = new MiddlewareFeatures().verifyToken();

		if (!verify.isUserAuthenticated) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}
		const user = await User.findById(verify.userId);
		if (!user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		const { name, description } = await request.json();

		const newCategory = {
			name,
			description,
			business: user.business,
			isDefault: false
		};

		const data = await Category.create(newCategory);

		const response = NextResponse.json(
			{
				status: 'success',
				data
			},
			{ status: 201 }
		);
		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
