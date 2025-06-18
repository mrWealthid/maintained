import { eachYearOfInterval } from 'date-fns';
import { format } from 'date-fns/format';
import { NextRequest, NextResponse } from 'next/server';
import Category from '@/model/ticketCategoryModel';
import { connect } from '@/dbConfig/dbConfig';
import { mapToObject } from '@/utils/helpers';
import MiddlewareFeatures from '@/middlewareFeatures';

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

		const query: any = request.nextUrl.searchParams;

		const transformedQuery = mapToObject(query);

		const regex = new RegExp(transformedQuery.name, 'i'); // 'i' for case-insensitive
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

		// if (!verify.isUserAuthenticated) {
		// 	return NextResponse.json(
		// 		{ error: 'Unauthorized access' },
		// 		{ status: 401 }
		// 	);
		// }

		const body = await request.json();

		console.log(body);

		const data = await Category.create(body);

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
