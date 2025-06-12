import Request from '@/model/requestModel';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: any) {
	try {
		const requestId = params.requestId;

		const cabin = await Request.findByIdAndDelete(requestId);

		if (!cabin) {
			return NextResponse.json(
				{ error: 'No request found with id' },
				{ status: 404 }
			);
		}
		const response = NextResponse.json({
			message: 'Request Deleted Successfully',
			success: true
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
