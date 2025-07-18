import { connect } from '@/dbConfig/dbConfig';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';
import APIFeatures from '@/utils/apiFeatures';
import { mapToObject } from '@/utils/helpers';
import MiddlewareFeatures from '@/middlewareFeatures';
import { getUserFromCookies } from '@/lib/auth/getUserFromCookies';

connect();

export async function GET(request: NextRequest) {
	try {
		let filter = {};

		const verify = await getUserFromCookies();
		if (!verify) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		if (verify.isAdminRole) {
			const user = await User.findById(verify.id);
			if (!user) {
				return NextResponse.json(
					{ error: 'User not found' },
					{ status: 404 }
				);
			}
			filter = { business: user.business };
		}

		if (verify.isUserRole) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const query: any = request.nextUrl.searchParams;
		const transformedQuery = mapToObject(query);

		//This is added for fields that should resolve with partial search
		if (transformedQuery.name) {
			const regex = new RegExp(transformedQuery.name, 'i'); // 'i' for case-insensitive
			filter = { ...filter, name: { $regex: regex } };
			delete transformedQuery.name; // Remove name from transformedQuery so it doesn't get double-filtered
		}

		const userQuery = User.find(filter);

		const features = new APIFeatures(userQuery, transformedQuery)
			.filter()
			.sort()
			.limitFields()
			.paginate()
			.populate([
				{
					path: 'business',
					select: 'businessName country'
				}
			]);

		const users = await features.query;

		let count;

		//I did this because pagination of filtered data was impossible, The endpoint keeps returning the total count of all document
		console.log('Query', Object.values(transformedQuery).length);
		console.log('Query', Object.values(transformedQuery));
		if (Object.values(transformedQuery).length > 0) {
			const excludedFields = ['page', 'sort', 'limit', 'fields'];
			excludedFields.forEach((el) => delete transformedQuery[el]);
			count = await User.find(filter)
				.find(transformedQuery)
				.countDocuments();
		} else {
			count = await User.countDocuments(filter);
		}

		const response = NextResponse.json({
			status: 'success',
			totalRecords: count,
			results: users.length,
			data: users
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
