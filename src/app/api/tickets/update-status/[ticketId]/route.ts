import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import MiddlewareFeatures from "@/middlewareFeatures";
import { TicketActivity } from "@/models/ticketActivity";
import Ticket from "@/models/ticketModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//     request: NextRequest,
//     { params }: { params: { ticketId: string } }
// ) {
//     try {
//         // const verify =await getUserFromCookies();

//         // if (!verify) {
//         // 	return NextResponse.json(
//         // 		{ error: 'Unauthorized access' },
//         // 		{ status: 401 }
//         // 	);
//         // }

//         const ticketId = params.ticketId;

//         const maintenanceRequest = await Ticket.findOne({
//             id: ticketId
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
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const verify = await getUserFromCookies();

    if (!verify || verify.isUserRole) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    const user = await User.findById(verify.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payload = {
      actionedBy: verify.id,
      status,
    };

    // 1. Get current (pre-update) ticket — for comparison/logging
    const previous = await Ticket.findById(ticketId);

    if (!previous) {
      return NextResponse.json(
        { error: "No ticket found with id" },
        { status: 404 }
      );
    }

    const updatedRequest = await Ticket.findByIdAndUpdate(
      ticketId,
      payload,

      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    //Log Ticket Activity --if it's an admin
    await TicketActivity.create({
      ticket: ticketId,
      action: "status-changed",
      description: `Actioned by ${user.name}`,
      changedBy: user.id,
      metadata: {
        field: "status",
        previous: previous.status,
        current: updatedRequest?.status,
      },
    });

    const response = NextResponse.json({
      message: "Ticket Updated Successfully",
      success: true,
      data: updatedRequest,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
