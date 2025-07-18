import { getUserFromCookies } from '@/lib/auth/getUserFromCookies';
import MiddlewareFeatures from '@/middlewareFeatures';
import { TicketActivity } from '@/model/ticketActivity';
import Ticket from '@/model/ticketModel';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ ticketId: string }> }
) {
	try {
		const { ticketId } = await params;
		const verify = await getUserFromCookies();

		if (!verify || !verify.isTechnicianRole || !verify.isSuperAdminRole) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		const { type } = await request.json();

		const user = await User.findById(verify.id);

		if (!user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		const payload = {
			actionedBy: verify.id,
			type
		};

		// 1. Get current (pre-update) ticket — for comparison/logging
		const previous = await Ticket.findById(ticketId);

		if (!previous) {
			return NextResponse.json(
				{ error: 'No ticket found with id' },
				{ status: 404 }
			);
		}

		const updatedRequest = await Ticket.findByIdAndUpdate(
			ticketId,
			payload,
			{
				new: true,
				runValidators: true,
				context: 'query'
			}
		);

		//Log Ticket Activity --if it's an admin
		await TicketActivity.create({
			ticket: ticketId,
			action: 'type-changed',
			description: `Assigned to ${user.name}`,
			changedBy: user._id,
			metadata: {
				field: 'type',
				previous: previous.type,
				current: updatedRequest?.type
			}
		});

		const response = NextResponse.json({
			message: 'Ticket Type Updated Successfully',
			success: true,
			data: updatedRequest
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
