import { TECHNICIAN_RESPONSE } from "@/shared/enums/enums";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { TechnicianRequest } from "@/models/technicanRequest";
import Ticket from "@/models/ticketModel";
import User from "@/models/userModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

connect();

type RespondPayload = {
  technician: string;
  ticket: string;
  status: string;
  quote?: {
    total?: number;
    cost: { title: string; amount: number }[];
    currency: string;
  };
  message?: string;
  reason?: string;
  schedule?: {
    date: Date;
    start: string;
    end: string;
    day: string;
  };
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const { requestId } = await params;
    const verify = await getUserFromCookies();
    if (!verify || verify.isUserRole) throw ApiError.unauthorized();

    const { status, reason, quote, message, schedule } = await request.json();

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    const technicianRequest = await TechnicianRequest.findOne({
      _id: requestId,
      technician: new mongoose.Types.ObjectId(verify.id),
    });

    if (!technicianRequest) {
      throw ApiError.notFound("Ticket request not found");
    }

    const existingTicket = await Ticket.findById(technicianRequest.ticket);
    if (!existingTicket) throw ApiError.notFound("Ticket not found");

    let payload: RespondPayload = {
      technician: verify.id,
      ticket: technicianRequest.ticket,
      status,
    };

    switch (status) {
      case TECHNICIAN_RESPONSE.applied:
        payload = {
          ...payload,
          quote: {
            ...(quote?.total && { total: quote.total }),
            cost: quote.cost,
            currency: quote.currency,
          },
          ...(schedule && {
            schedule: {
              date: new Date(schedule.date),
              start: schedule.start,
              end: schedule.end,
              day: schedule.day,
            },
          }),
          message,
        };
        break;

      case TECHNICIAN_RESPONSE.declined:
        payload = { ...payload, reason };
        break;

      case TECHNICIAN_RESPONSE.inspection_requested:
        break;

      default:
        throw ApiError.badRequest("Invalid technician response");
    }

    const updatedTicket = await TechnicianRequest.findByIdAndUpdate(
      requestId,
      payload,
      { new: true, runValidators: true },
    );

    return NextResponse.json({
      message: "Technician response saved",
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const { requestId } = await params;

    const ticket =
      await TechnicianRequest.findById(requestId).populate("ticket");

    if (!ticket) throw ApiError.notFound("Ticket not found");

    return NextResponse.json({ status: "success", data: ticket });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
