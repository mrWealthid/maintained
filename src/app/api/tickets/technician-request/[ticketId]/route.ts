import { TICKET_STATUS } from '@/app/shared/enums/enums';
import MiddlewareFeatures from '@/middlewareFeatures';
import { TechnicianRequest } from '@/model/technicanRequest';
import { TicketActivity } from '@/model/ticketActivity';
import Ticket from '@/model/ticketModel';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(
	request: NextRequest,
	{ params }: { params: { ticketId: string } }
) {
	try {
		const ticketId = params.ticketId;
		const verify = new MiddlewareFeatures().verifyToken();

		if (!verify.isUserAuthenticated || verify.isUserRole) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		const adminUser = await User.findById(verify.userId);
		if (!adminUser) {
			return NextResponse.json(
				{ error: 'Admin user not found' },
				{ status: 404 }
			);
		}

		const body = await request.json();
		const { technicianIds } = body;

		if (!Array.isArray(technicianIds) || technicianIds.length === 0) {
			return NextResponse.json(
				{ error: 'At least one technician ID must be provided' },
				{ status: 400 }
			);
		}

		const ticket = await Ticket.findById(ticketId);
		if (!ticket) {
			return NextResponse.json(
				{ error: 'Ticket not found' },
				{ status: 400 }
			);
		}

		const existingRequests = await TechnicianRequest.find({
			ticket: ticketId
		});
		const alreadyRequestedTechIds = existingRequests.map((r) =>
			r.technician.toString()
		);

		// Filter out duplicates
		const newTechIds = technicianIds.filter(
			(id) => !alreadyRequestedTechIds.includes(id)
		);

		const newRequests = await Promise.all(
			newTechIds.map((techId) =>
				TechnicianRequest.create({
					ticket: ticketId,
					technician: techId,
					sentBy: adminUser._id
				})
			)
		);

		//update ticket status to pending assignment
		if (newRequests.length > 0) {
			ticket.status = TICKET_STATUS.pending_assignment;
			await ticket.save();
		}

		// // Optionally log each new activity
		// await Promise.all(
		// 	newRequests.map((req) =>
		// 		TicketActivity.create({
		// 			ticket: ticketId,
		// 			action: 'assignment-request-sent',
		// 			changedBy: adminUser._id,
		// 			description: `Assignment request sent to technician with ID ${req.technician}`,
		// 			metadata: {
		// 				technicianId: req.technician
		// 			}
		// 		})
		// 	)
		// );

		await TicketActivity.create({
			ticket: ticketId,
			action: 'status-changed',
			description: `Request sent to technicians for assignment`,
			changedBy: adminUser._id
		});

		return NextResponse.json({
			message: 'Technician assignment requests sent successfully',
			success: true,
			count: newRequests.length,
			requests: newRequests
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
