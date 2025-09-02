import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import MiddlewareFeatures from "@/middlewareFeatures";
import { TicketActivity } from "@/models/ticketActivity";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const verify = await getUserFromCookies();
    const { ticketId } = await params;

    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const data = await TicketActivity.find({ ticket: ticketId });

    const response = NextResponse.json({
      status: "success",
      data,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
