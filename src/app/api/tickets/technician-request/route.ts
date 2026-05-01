import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import { TechnicianRequest } from "@/models/technicanRequest";
import APIFeatures from "@/utils/apiFeatures";
import { mapToObject } from "@/utils/helpers";
import Ticket from "@/models/ticketModel";
import { TechnicianRequestDetails } from "@/features/ticket-feat/model/ticket.model";

connect();

export async function GET(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();
    if (!verify || verify.isUserRole) throw ApiError.unauthorized();

    let filter: Record<string, unknown> = { technician: verify.id };
    if (verify.isTechnicianRole) {
      filter = { ...filter, isActive: true };
    }

    const transformedQuery = mapToObject(
      request.nextUrl.searchParams as unknown as Map<string, string>,
    );

    if ("title" in transformedQuery) {
      const titleQuery = String(transformedQuery["title"]);
      const matchingTickets = await Ticket.find({
        title: { $regex: new RegExp(titleQuery, "i") },
      }).select("_id");

      const ticketIds = matchingTickets.map((t) => t._id);
      filter.ticket = { $in: ticketIds };
      delete transformedQuery["title"];
    }

    const requestQuery = TechnicianRequest.find(filter);

    const features = new APIFeatures(requestQuery, transformedQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate({
        path: "ticket",
        populate: [{ path: "category" }, { path: "user" }],
      });
    const requests = await features.query;

    const countFeatures = new APIFeatures<TechnicianRequestDetails>(
      TechnicianRequest.find(filter),
      transformedQuery,
    ).filter();

    const count = await countFeatures.query.countDocuments();

    return NextResponse.json(
      {
        totalRecords: count,
        results: requests.length,
        status: "success",
        data: requests,
      },
      { status: 200 },
    );
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
