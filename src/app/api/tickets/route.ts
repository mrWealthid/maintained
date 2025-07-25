import APIFeatures from '@/utils/apiFeatures';
import { NextRequest, NextResponse } from 'next/server';
import Ticket from '@/model/ticketModel';
import { connect } from '@/dbConfig/dbConfig';
import { mapToObject } from '@/utils/helpers';
import MiddlewareFeatures from '@/middlewareFeatures';
import { Types } from 'mongoose';
import User from '@/model/userModel';
import { TicketActivity } from '@/model/ticketActivity';
import { TICKET_STATUS } from '@/app/shared/enums/enums';
import { getUserFromCookies } from '@/lib/auth/getUserFromCookies';
import mongoose from 'mongoose';

connect();

export async function GET(request: NextRequest) {
	try {
		//2) Check if user exists & password is correct after it's hashed
		const verify = await getUserFromCookies();
		if (!verify) {
			return NextResponse.json(
				{ error: 'UnAuthorized' },
				{ status: 401 }
			);
		}

		let filter = {};
		if (verify.isAdminRole) {
			const user = await User.findById(verify.id);
			if (!user) {
				return NextResponse.json(
					{ error: 'User not found' },
					{ status: 404 }
				);
			}
			filter = { business: new mongoose.Types.ObjectId(user.business) };
		}

		if (verify.isUserRole) {
			filter = { user: new mongoose.Types.ObjectId(verify.id) };
		}

		if (verify.isTechnicianRole) {
			// Only allow tickets assigned to this technician with specific statuses
			filter = {
				assignedTo: verify.id,
				status: {
					$in: [
						TICKET_STATUS.pending_assignment,
						TICKET_STATUS.assigned,
						TICKET_STATUS.scheduled,
						TICKET_STATUS.completed
					]
				}
			};
		}

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

		// Group ticket counts by status
		const statusCounts = await Ticket.aggregate([
			{ $match: filter }, // Match filtered tickets only
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 }
				}
			}
		]);

		// Convert to object like { pending: 2, assigned: 3 }
		const statusSummary = statusCounts.reduce(
			(acc, curr) => {
				acc[curr._id] = curr.count;
				return acc;
			},
			{} as Record<string, number>
		);

		const response = NextResponse.json(
			{
				totalRecords: count,
				results: requests.length,
				status: 'success',
				data: requests,
				summary: statusSummary // <-- Add
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
		const verify = await getUserFromCookies();
		if (!verify) {
			return NextResponse.json(
				{ error: 'UnAuthorized' },
				{ status: 401 }
			);
		}
		const user = await User.findById(verify.id);

		if (!user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}
		const body = await request.json();

		//create Ticket
		const data = await Ticket.create({
			...body,
			user: verify.id,
			business: user.business
		});

		//Log Ticket Activity
		await TicketActivity.create({
			ticket: data.id,
			action: 'created',
			description: `Ticket created with title: "${data.title}"`,
			changedBy: user.id,
			metadata: {
				field: 'assignedTo',
				previous: null,
				current: user.id
			}
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
