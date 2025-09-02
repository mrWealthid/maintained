import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import Ticket from "@/models/ticketModel";
import mongoose from "mongoose";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

    const user = await getUserFromCookies(request);

    console.log(user);
    if (!user || (!user.isAdminRole && !user.isSuperAdminRole)) {
      {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    const { actionedBy, status } = body;

    if (!mongoose.Types.ObjectId.isValid(actionedBy)) {
      return NextResponse.json(
        { error: "Invalid actionedBy ID" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isPending = ticket.status === "PENDING";
    const isSameActionedBy = ticket.actionedBy?.toString() === user.id;

    // If not pending, only the current actionedBy or a SuperAdmin can change
    if (!isPending && !(isSameActionedBy || user.isSuperAdminRole)) {
      return NextResponse.json(
        { error: "You are not allowed to update this ticket" },
        { status: 403 }
      );
    }

    await Ticket.findByIdAndUpdate(ticketId, {
      actionedBy: actionedBy,
      status: status,
    });

    return NextResponse.json(
      { message: "Ticket actionedBy updated successfully", ticket },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
