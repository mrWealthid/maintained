import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { TicketActivity } from "@/models/ticketActivity";
import { resolveTicketIdentifier } from "@/lib/tickets/resolve-ticket-identifier";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();

    const { slug } = await params;
    const ticketId = await resolveTicketIdentifier(slug);
    const data = await TicketActivity.find({ ticket: ticketId })
      .sort({ createdAt: -1 })
      .populate({ path: "changedBy", select: "name email photo" })
      .lean();

    return NextResponse.json({ status: "success", data });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
