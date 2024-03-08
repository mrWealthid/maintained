import { eachYearOfInterval } from 'date-fns';
import { format } from 'date-fns/format';
import { NextRequest, NextResponse } from 'next/server';
import Request from '@/model/requestModel';
import { connect } from '@/dbConfig/dbConfig';
// import { mapToObject } from '../../../../utils/helper';

connect();
function mapToObject(map: Map<string, any>): { [key: string]: any } {
	const obj: { [key: string]: any } = {};
	for (let [key, value] of map) {
		// Checking if the value is a string representation of a number
		if (typeof value === 'string' && !isNaN(Number(value))) {
			value = Number(value);
		}
		obj[key] = value;
	}
	return obj;
}

export async function GET(request: NextRequest, { params }: any) {
	try {
		//2) Check if user exists & password is correct after it's hashed

		let cookie = request.cookies.get('token')?.value || '';

		const query: any = request.nextUrl.searchParams;

		const transformedQuery = mapToObject(query);

		// const guests = await Guest.find();

		const regex = new RegExp(transformedQuery.name, 'i'); // 'i' for case-insensitive
		const results = await Request.find({ name: { $regex: regex } });

		const response = NextResponse.json({
			status: 'success',
			data: results
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
export async function POST(request: NextRequest, { params }: any) {
	try {
		//2) Check if user exists & password is correct after it's hashed

		let cookie = request.cookies.get('token')?.value || '';

		const body = await request.json();

		const data = await Request.create(body);

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
