import MiddlewareFeatures from '@/middlewareFeatures';
import { TicketActivity } from '@/model/ticketActivity';
import User from '@/model/userModel';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
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


		const data = await TicketActivity.find({ ticket: ticketId });


		const response = NextResponse.json({
			status: 'success',
			data
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
