import APIFeatures from '@/utils/apiFeatures';
import { NextRequest, NextResponse } from 'next/server';
import Ticket from '@/model/ticketModel';
import { connect } from '@/dbConfig/dbConfig';
import { mapToObject } from '@/utils/helpers';
import MiddlewareFeatures from '@/middlewareFeatures';
import { Types } from 'mongoose';
import User from '@/model/userModel';

connect();

export async function GET(request: NextRequest) {
	try {
		//2) Check if user exists & password is correct after it's hashed
		const verify = new MiddlewareFeatures().verifyToken();
		if (!verify?.isUserAuthenticated) {
			return NextResponse.json(
				{ error: 'UnAuthorized' },
				{ status: 401 }
			);
		}

		let filter = {};
		if (verify.isAdminRole) {
			const user = await User.findById(verify.userId);
			if (!user) {
				return NextResponse.json(
					{ error: 'User not found' },
					{ status: 404 }
				);
			}
			filter = { business: user.business };
		}

		if (verify.isUserRole) {
			filter = { user: verify.userId };
		}

		// console.log(isAuthUser);
		// let cookie = request.cookies.get('token')?.value || '';

		const query: any = request.nextUrl.searchParams;

		const transformedQuery = mapToObject(query);

		if (transformedQuery.title) {
			const regex = new RegExp(transformedQuery.title, 'i'); // 'i' for case-insensitive
			filter = { ...filter, title: { $regex: regex } };
			delete transformedQuery.title; // Remove name from transformedQuery so it doesn't get double-filtered
		}

		const requestQuery = Ticket.find(filter);

		const features = new APIFeatures(requestQuery, transformedQuery)
			.filter()
			.sort()
			.limitFields()
			.paginate()
			.populate([
				{
					path: 'category',
					select: 'name '
				},
				{
					path: 'user',
					select: 'name'
				},
				{
					path: 'business',
					select: 'businessName'
				},
				{
					path: 'actionedBy',
					select: 'name'
				}
			]);
		const requests = await features.query;

		let count;

		// console.log( await Model.find(req.query))

		//I did this because pagination of filtered data was impossible, The endpoint keeps returning the total count of all document

		if (Object.values(transformedQuery).length > 0) {
			const excludedFields = ['page', 'sort', 'limit', 'fields'];
			excludedFields.forEach((el) => delete transformedQuery[el]);
			count = await Ticket.find(filter)
				.find(transformedQuery)
				.countDocuments();
		} else {
			count = await Ticket.countDocuments(filter);
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

export async function POST(request: NextRequest, { params }: any) {
	try {
		//2) Check if user exists & password is correct after it's hashed
		const verify = new MiddlewareFeatures().verifyToken();
		if (!verify?.isUserAuthenticated) {
			return NextResponse.json(
				{ error: 'UnAuthorized' },
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
		const body = await request.json();

		const data = await Ticket.create({
			...body,
			user: verify.userId,
			business: user.business
		});

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
