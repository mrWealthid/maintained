import MiddlewareFeatures from '@/middlewareFeatures';
import Ticket from '@/model/ticketModel';
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
		const verify = new MiddlewareFeatures().verifyToken();

		if (!verify.isUserAuthenticated) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		const { status, ...rest } = await request.json();
		const ticketId = params.ticketId;

		const updatedRequest = await Ticket.findByIdAndUpdate(
			ticketId,
			status,
			{
				new: true,
				runValidators: true
			}
		);

		if (!updatedRequest) {
			return NextResponse.json(
				{ error: 'No ticket found with id' },
				{ status: 404 }
			);
		}
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
