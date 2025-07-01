import MiddlewareFeatures from '@/middlewareFeatures';
import { TicketActivity } from '@/model/ticketActivity';
import Ticket from '@/model/ticketModel';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';

// export async function GET(
//     request: NextRequest,
//     { params }: { params: { ticketId: string } }
// ) {
//     try {
//         // const verify = new MiddlewareFeatures().verifyToken();

//         // if (!verify.isUserAuthenticated) {
//         // 	return NextResponse.json(
//         // 		{ error: 'Unauthorized access' },
//         // 		{ status: 401 }
//         // 	);
//         // }

//         const ticketId = params.ticketId;

//         const maintenanceRequest = await Ticket.findOne({
//             _id: ticketId
//         }).populate({
//             path: 'category',
//             select: 'name '
//         });

//         const response = NextResponse.json({
//             status: 'success',
//             data: maintenanceRequest
//         });

//         return response;
//     } catch (error: any) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

export async function PATCH(
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

		const { status } = await request.json();

		const user = await User.findById(verify.userId);

		if (!user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		const payload = {
			actionedBy: verify.userId,
			status
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
			action: 'status-changed',
			description: `Assigned to ${user.name}`,
			changedBy: user._id,
			metadata: {
				field: 'status',
				previous: previous.status,
				current: updatedRequest?.status
			}
		});

		const response = NextResponse.json({
			message: 'Ticket Updated Successfully',
			success: true,
			data: updatedRequest
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { ticketId: string } }
) {
	try {
		const verify = new MiddlewareFeatures().verifyToken();

		if (!verify.isUserAuthenticated) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		const ticketId = params.ticketId;

		const ticket = await Ticket.findByIdAndDelete(ticketId);

		if (!ticket) {
			return NextResponse.json(
				{ error: 'No request found with id' },
				{ status: 404 }
			);
		}
		const response = NextResponse.json({
			message: 'Ticket deleted Successfully',
			success: true
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
