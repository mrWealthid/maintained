import { TECHNICIAN_RESPONSE } from '@/app/shared/enums/enums';
import { connect } from '@/dbConfig/dbConfig';
import MiddlewareFeatures from '@/middlewareFeatures';
import { TechnicianRequest } from '@/model/technicanRequest';
import { TicketActivity } from '@/model/ticketActivity';
import Ticket from '@/model/ticketModel';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';

connect();
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { requestId: string } }
) {
	try {
		const requestId = params.requestId;
		const verify = new MiddlewareFeatures().verifyToken();

		if (!verify.isUserAuthenticated || verify.isUserRole) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}
		const { status, reason, quote, message, schedule } =
			await request.json();

		const user = await User.findById(verify.userId);

		if (!user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		// const existingRequest = await TechnicianRequest.findById(requestId);
		// const existingTicket = await Ticket.findById(ticketId);

		const technicianRequest = await TechnicianRequest.findOne({
			_id: requestId,
			technician: verify.userId
		});

		//Verify this had been assigned to the loggedIn Technician
		if (!technicianRequest) {
			return NextResponse.json(
				{ error: 'Ticket request not found' },
				{ status: 404 }
			);
		}

		const existingTicket = await Ticket.findById(technicianRequest.ticket);

		if (!existingTicket) {
			return NextResponse.json(
				{ error: 'Ticket not found' },
				{ status: 404 }
			);
		}

		// Prepare changes based on technician response
		type Payload = {
			technician: string;
			ticket: string;
			status: string;
			quote?: { amount: number; currency: string };
			message?: string;
			reason?: string;
			schedule?: {
				date: Date;
				start: string;
				end: string;
				day: string;
			};
		};

		let payload: Payload = {
			technician: verify.userId,
			ticket: technicianRequest.ticket,
			status
		};

		let logDescription = '';
		let newStatus = technicianRequest.status; // default, no status change

		switch (status) {
			case TECHNICIAN_RESPONSE.applied:
				newStatus = TECHNICIAN_RESPONSE.applied;
				payload = {
					...payload,
					quote: {
						amount: quote.amount,
						currency: quote.currency || 'USD'
					},
					...(schedule && {
						schedule: {
							date: new Date(schedule.date),
							start: schedule.start,
							end: schedule.end,
							day: schedule.day
						}
					}),
					message
				};
				logDescription =
					` ${user.name} applied to the ticket with a quote of ${quote.amount} ${quote.currency}` +
					(schedule?.date
						? ` and proposed schedule on ${schedule.date}`
						: '');
				break;

			case TECHNICIAN_RESPONSE.declined:
				newStatus = TECHNICIAN_RESPONSE.declined;
				// updatedFields.assignedTo = null; // unassign technician
				// newStatus = 'pending'; // or keep as 'assigned' depending on flow
				payload = { ...payload, reason };
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

		// updatedFields.status = newStatus;
		// updatedFields.actionedBy = verify.userId;

		console.log('Payload for update:', payload);
		const updatedTicket = await TechnicianRequest.findByIdAndUpdate(
			requestId,
			payload,
			{ new: true, runValidators: true }
		);

		// await TicketActivity.create({
		// 	ticket: technicianRequest.ticket,
		// 	action: `status-changed`,
		// 	description: logDescription,
		// 	changedBy: user._id,
		// 	// metadata: {
		// 	// 	field: 'status',
		// 	// 	previous: existingTicket.status,
		// 	// 	current: newStatus
		// 	// }
		// });

		return NextResponse.json({
			message: 'Technician response saved',
			success: true,
			data: updatedTicket
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
