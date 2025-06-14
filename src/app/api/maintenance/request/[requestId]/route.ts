import MiddlewareFeatures from '@/middlewareFeatures';
import Request from '@/model/requestModel';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: { requestId: string } }
) {
	try {
		// const verify = new MiddlewareFeatures().verifyToken();

		// if (!verify.isUserAuthenticated) {
		// 	return NextResponse.json(
		// 		{ error: 'Unauthorized access' },
		// 		{ status: 401 }
		// 	);
		// }

		const requestId = params.requestId;

		const maintenanceRequest = await Request.findOne({
			_id: requestId
		}).populate({
			path: 'category',
			select: 'name '
		});

		const response = NextResponse.json({
			status: 'success',
			data: maintenanceRequest
		});

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { requestId: string } }
) {
	try {
		const verify = new MiddlewareFeatures().verifyToken();

		if (!verify.isUserAuthenticated) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const requestId = params.requestId;

		const updatedRequest = await Request.findByIdAndUpdate(
			requestId,
			body,
			{
				new: true,
				runValidators: true
			}
		);

		if (!updatedRequest) {
			return NextResponse.json(
				{ error: 'No cabin found with ID' },
				{ status: 404 }
			);
		}
		const response = NextResponse.json({
			message: 'Request Updated Successfully',
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
	{ params }: { params: { requestId: string } }
) {
	try {
		const verify = new MiddlewareFeatures().verifyToken();

		if (!verify.isUserAuthenticated) {
			return NextResponse.json(
				{ error: 'Unauthorized access' },
				{ status: 401 }
			);
		}
		const requestId = params.requestId;

		const maintenanceRequest = await Request.findByIdAndDelete(requestId);

		if (!maintenanceRequest) {
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
