import APIFeatures from '@/utils/apiFeatures';
import { eachYearOfInterval } from 'date-fns';
import { format } from 'date-fns/format';
import { NextRequest, NextResponse } from 'next/server';
import Request from '@/model/requestModel';
import { connect } from '@/dbConfig/dbConfig';
import { mapToObject, fileToBase64 } from '@/utils/helpers';
import cloudinary from '@/utils/cloudinary';
import DatauriParser from 'datauri/parser';
import path from 'path';
import axios from 'axios';
import MiddlewareFeatures from '@/middlewareFeatures';
import mongoose, { Types, ObjectId, Mongoose } from 'mongoose';
import User from '@/model/userModel';

// import { mapToObject } from '../../../../utils/helper';

connect();

// export const config = {
// 	api: {
// 		bodyParser: false
// 	}
// };
// const verify = new MiddlewareFeatures().verifyToken();

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
			filter = { business: new Types.ObjectId(user.business) };
		}

		if (verify.isUserRole) {
			filter = { user: new Types.ObjectId(verify.userId) };
		}

		// console.log(isAuthUser);
		// let cookie = request.cookies.get('token')?.value || '';

		const query: any = request.nextUrl.searchParams;

		const transformedQuery = mapToObject(query);

		// console.log(transformedQuery);

		const requestQuery = Request.find(filter).populate([
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
			}
		]);

		const features = new APIFeatures(requestQuery, transformedQuery)
			.filter()
			.sort()
			.limitFields()
			.paginate();
		const requests = await features.query;

		let count;

		// console.log( await Model.find(req.query))

		//I did this because pagination of filtered data was impossible, The endpoint keeps returning the total count of all document

		if (Object.values(transformedQuery).length > 0) {
			const excludedFields = ['page', 'sort', 'limit', 'fields'];
			excludedFields.forEach((el) => delete transformedQuery[el]);
			count = await Request.find(filter)
				.find(transformedQuery)
				.countDocuments();
		} else {
			count = await Request.countDocuments(filter);
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
		const body = await request.json();

		// // create video
		// const createVideo = async (vid: any) => {
		// 	const base64Video = parser.format(
		// 		path.extname(vid.originalname).toString(),
		// 		vid.buffer
		// 	);
		// 	const uploadedVideoResponse = await cloudinary.v2.uploader.upload(
		// 		base64Video.content!,

		// 		{ resource_type: 'video' }
		// 	);
		// 	return uploadedVideoResponse;
		// };

		const data = await Request.create({
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
