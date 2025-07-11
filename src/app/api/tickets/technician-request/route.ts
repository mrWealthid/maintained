import { connect } from '@/dbConfig/dbConfig';
import MiddlewareFeatures from '@/middlewareFeatures';
import { TechnicianRequest } from '@/model/technicanRequest';
import APIFeatures from '@/utils/apiFeatures';
import { mapToObject } from '@/utils/helpers';
import { NextRequest, NextResponse } from 'next/server';

connect();
export async function GET(request: NextRequest) {
	try {
		let filter = {};
		const verify = new MiddlewareFeatures().verifyToken();

		if (!verify.isUserAuthenticated || verify.isUserRole) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		filter = { technician: verify.userId };

		if (verify.isTechnicianRole) {
			filter = { ...filter, isActive: true };
		}
		const query: any = request.nextUrl.searchParams;

		const transformedQuery = mapToObject(query);
		const requestQuery = TechnicianRequest.find(filter);

		const features = new APIFeatures(requestQuery, transformedQuery)
			.filter()
			.sort()
			.limitFields()
			.paginate()
			.populate({
				path: 'ticket',
				populate: [{ path: 'category' }, { path: 'user' }]
			});
		const requests = await features.query;

		let count;

		//I did this because pagination of filtered data was impossible, The endpoint keeps returning the total count of all document

		if (Object.values(transformedQuery).length > 0) {
			const excludedFields = ['page', 'sort', 'limit', 'fields'];
			excludedFields.forEach((el) => delete transformedQuery[el]);
			count = await TechnicianRequest.find(filter)
				.find(transformedQuery)
				.countDocuments();
		} else {
			count = await TechnicianRequest.countDocuments(filter);
		}

		const response = NextResponse.json(
			{
				totalRecords: count,
				results: requests.length,
				status: 'success',
				data: requests
			},
			{ status: 200 }
		);

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
