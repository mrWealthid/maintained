import { TECHNICIAN_RESPONSE, TICKET_STATUS } from '@/app/shared/enums/enums';
import MiddlewareFeatures from '@/middlewareFeatures';
import { TicketActivity } from '@/model/ticketActivity';
import Ticket from '@/model/ticketModel';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { ticketId: string } }
) {
	try {
		const ticketId = params.ticketId;
		const verify = new MiddlewareFeatures().verifyToken();
		const { response: ticketResponse, reason } = await request.json();

		if (!verify.isUserAuthenticated || verify.isUserRole) {
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

		const existingTicket = await Ticket.findById(ticketId);

		if (!existingTicket) {
			return NextResponse.json(
				{ error: 'Ticket not found' },
				{ status: 404 }
			);
		}

		//Verify this had been assigned to the loggedIn Technician
		if (
			existingTicket.assignedTo?.toString() !== verify.userId.toString()
		) {
			return NextResponse.json(
				{ error: 'No assigned Ticket found' },
				{ status: 404 }
			);
		}
		// Prepare changes based on technician response
		let updatedFields: any = {
			technicianResponse: {
				response: ticketResponse,
				message: reason,
				respondedAt: new Date()
			}
		};

		let logDescription = '';
		let newStatus = existingTicket.status; // default, no status change

		switch (ticketResponse) {
			case TECHNICIAN_RESPONSE.accepted:
				newStatus = TICKET_STATUS.assigned;
				logDescription = `${user.name} accepted the ticket.`;
				break;

			case TECHNICIAN_RESPONSE.declined:
				updatedFields.assignedTo = null; // unassign technician
				// newStatus = 'pending'; // or keep as 'assigned' depending on flow
				logDescription = `${user.name} declined the ticket: ${reason}`;
				break;

			case TECHNICIAN_RESPONSE.inspection_requested:
				// newStatus = 'inspection-requested';
				logDescription = `${user.name} requested an inspection: ${reason}`;
				break;

			default:
				return NextResponse.json(
					{ error: 'Invalid technician response' },
					{ status: 400 }
				);
		}

		updatedFields.status = newStatus;
		// updatedFields.actionedBy = verify.userId;

		const updatedTicket = await Ticket.findByIdAndUpdate(
			ticketId,
			updatedFields,
			{ new: true, runValidators: true }
		);

		await TicketActivity.create({
			ticket: ticketId,
			action: `status-changed`,
			description: logDescription,
			changedBy: user._id,
			metadata: {
				field: 'status',
				previous: existingTicket.status,
				current: newStatus
			}
		});

		return NextResponse.json({
			message: 'Technician response saved',
			success: true,
			data: updatedTicket
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
