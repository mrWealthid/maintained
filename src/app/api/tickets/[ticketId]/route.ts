import { getUserFromCookies } from '@/lib/auth/getUserFromCookies';
import MiddlewareFeatures from '@/middlewareFeatures';
import Ticket from '@/model/ticketModel';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ ticketId: string }> }
) {
	try {
		const { ticketId } = await params;

		// const ticket = await Ticket.findOne({
		// 	id: ticketId
		// }).populate([
		// 	{
		// 		path: 'category',
		// 		select: 'name'
		// 	},
		// 	{
		// 		path: 'user',
		// 		select: 'name email'
		// 	},
		// 	{ path: 'requests' }
		// ]);

		const ticket = await Ticket.findById(ticketId).populate([
			{
				path: 'category',
				select: 'name'
			},
			{
				path: 'user',
				select: 'name email'
			},
			{
				path: 'requests',
				populate: { path: 'technician', select: 'name email' }
			}
		]);

		console.log('Populated Ticket:', ticket);

		if (!ticket) {
			return NextResponse.json(
				{ error: 'Ticket not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			status: 'success',
			data: ticket.toJSON() // ✅ includes virtuals like 'requests'
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
// export async function GET(
// 	request: NextRequest,
// 	{ params }: { params: { ticketId: string } }
// ) {
// 	try {
// 		const verify =await getUserFromCookies();

// 		if (!verify) {
// 			return NextResponse.json(
// 				{ error: 'Unauthorized access' },
// 				{ status: 401 }
// 			);
// 		}

// 		const ticketId = params.ticketId;

// 		const ticket = await Ticket.findOne({
// 			id: ticketId,
// 			user: verify.id
// 		}).populate({
// 			path: 'category',
// 			select: 'name '
// 		});

// 		if (!ticket) {
// 			return NextResponse.json(
// 				{
// 					error: 'No ticket not found'
// 				},
// 				{ status: 403 }
// 			);
// 		}

// 		const response = NextResponse.json({
// 			status: 'success',
// 			data: ticket
// 		});

// 		return response;
// 	} catch (error: any) {
// 		return NextResponse.json({ error: error.message }, { status: 500 });
// 	}
// }

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ ticketId: string }> }
) {
	const { ticketId } = await params;
	try {
		const verify = await getUserFromCookies();

		if (!verify) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		const { status, ...rest } = await request.json();

		// const updatedRequest = await Ticket.findByIdAndUpdate(ticketId, rest, {
		// 	new: true,
		// 	runValidators: true
		// });

		const updatedRequest = await Ticket.findOneAndUpdate(
			{ id: ticketId, user: verify.id }, // Ensure user is the owner
			rest,
			{ new: true, runValidators: true }
		);

		if (!updatedRequest) {
			return NextResponse.json(
				{
					error: 'You are not authorized to update this ticket or ticket not found'
				},
				{ status: 403 }
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
	{ params }: { params: Promise<{ ticketId: string }> }
) {
	const { ticketId } = await params;
	try {
		const verify = await getUserFromCookies();

		if (!verify || !verify.isUserRole) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		const ticket = await Ticket.findOneAndDelete({
			id: ticketId,
			user: verify.id // ← only delete if the user owns the ticket
		});

		if (!ticket) {
			return NextResponse.json(
				{
					error: 'Ticket not found or you are not authorized to delete this ticket'
				},
				{ status: 403 }
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
