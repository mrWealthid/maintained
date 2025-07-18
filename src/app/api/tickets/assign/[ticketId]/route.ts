import { ROLES, TICKET_STATUS } from '@/app/shared/enums/enums';
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

		if (!verify || verify.isUserRole) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		const { assignedTo } = await request.json();

		const adminUser = await User.findById(verify.id);
		if (!adminUser) {
			return NextResponse.json(
				{ error: 'Admin user not found' },
				{ status: 404 }
			);
		}

		const technician = await User.findById(assignedTo);
		if (!technician || technician.role !== ROLES.technician) {
			return NextResponse.json(
				{ error: 'Invalid technician' },
				{ status: 400 }
			);
		}

		const previous = await Ticket.findById(ticketId);
		if (!previous) {
			return NextResponse.json(
				{ error: 'No ticket found with id' },
				{ status: 404 }
			);
		}

		// send assignment technician request
		const updatedRequest = await Ticket.findByIdAndUpdate(
			ticketId,
			{
				actionedBy: adminUser._id,
				assignedTo,
				status: TICKET_STATUS.pending_assignment
			},
			{ new: true, runValidators: true, context: 'query' }
		);

		await TicketActivity.create({
			ticket: ticketId,
			action: 'status-changed',
			description: `Ticket assigned to ${technician.name}`,
			changedBy: adminUser._id,
			metadata: {
				field: 'assignedTo',
				previous: previous.assignedTo || null,
				current: assignedTo
			}
		});

		return NextResponse.json({
			message: 'Technician assigned successfully',
			success: true,
			data: updatedRequest
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
