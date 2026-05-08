import APIFeatures from "@/utils/apiFeatures";
import { NextRequest, NextResponse } from "next/server";
import Ticket from "@/models/ticketModel";
import Category from "@/models/ticketCategoryModel";
import Unit from "@/models/unitModel";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { TicketActivity } from "@/models/ticketActivity";
import { ROLES, TICKET_STATUS } from "@/shared/enums/enums";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import mongoose from "mongoose";
import { Ticket as ITicket } from "@/shared/model/model";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import {
  ticketFormSchema,
  ticketListQuerySchema,
} from "@/features/tickets/models/ticket-form.model";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

connect();

export async function GET(request: NextRequest) {
  try {
    //2) Check if user exists & password is correct after it's hashed
    const verify = await getUserFromCookies();
    if (!verify) {
      throw ApiError.unauthorized();
    }
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_VIEW);

    let filter = {};
    const user = await User.findById(verify.id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    if (verify.role === ROLES.admin) {
      filter = { business: user.currentBusiness };
    }

    if (verify.isUserRole) {
      filter = {
        user: new mongoose.Types.ObjectId(verify.id),
        business: user.currentBusiness,
      };
    }

    if (verify.isTechnicianRole) {
      // Only allow tickets assigned to this technician with specific statuses
      filter = {
        assignedTo: verify.id,
        status: {
          $in: [
            TICKET_STATUS.pending_assignment,
            TICKET_STATUS.assigned,
            TICKET_STATUS.scheduled,
            TICKET_STATUS.completed,
          ],
        },
      };
    }

    const parsedQuery = parseOrThrow(
      ticketListQuerySchema
        .extend({
          title: ticketListQuerySchema.shape.search.optional(),
          category: ticketListQuerySchema.shape.search.optional(),
          user: ticketListQuerySchema.shape.search.optional(),
        })
        .passthrough(),
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const transformedQuery: Record<string, unknown> = { ...parsedQuery };
    //handling nested filters / partial match
    if (parsedQuery.title) {
      const regex = new RegExp(parsedQuery.title, "i"); // 'i' for case-insensitive
      filter = { ...filter, title: { $regex: regex } };
      delete transformedQuery.title; // Remove name from transformedQuery so it doesn't get double-filtered
    }

    if (parsedQuery.category) {
      const categoryName = parsedQuery.category.trim();
      const categoryFound = await Category.findOne({
        name: new RegExp(categoryName, "i"),
      }).select("_id");
      // keep your same pattern:
      transformedQuery["category"] = categoryFound ? categoryFound._id : null;
      // If you prefer “no matches” to truly return none, you could delete the key instead:
      // if (!categoryFound) delete transformedQuery["category"];
    }

    if (parsedQuery.user) {
      const userName = parsedQuery.user.trim();
      const userFound = await User.findOne({
        name: new RegExp(userName, "i"),
      }).select("_id");
      transformedQuery["user"] = userFound ? userFound._id : null;
      // Optionally: if (!userFound) delete transformedQuery["user"];
    }

    const requestQuery = Ticket.find(filter);

    const features = new APIFeatures(requestQuery, transformedQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate([
        {
          path: "category",
          select: "name ",
        },
        {
          path: "user",
          select: "name",
        },
        {
          path: "business",
          select: "businessName",
        },
        {
          path: "actionedBy",
          select: "name",
        },
        {
          path: "relatedTo",
          select: "title status createdAt propertyName unitLabel",
        },
        // {
        //   path: "property",
        //   select: "name",
        // },
        // {
        //   path: "unit",
        //   select: "name",
        // },
      ]);
    const requests = await features.query;

    const countFeatures = new APIFeatures<ITicket>(
      Ticket.find(filter),
      transformedQuery
    ).filter();

    const count = await countFeatures.query.countDocuments();

    // Group ticket counts by status
    const statusCounts = await Ticket.aggregate([
      { $match: filter }, // Match filtered tickets only
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to object like { pending: 2, assigned: 3 }
    const statusSummary = statusCounts.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const response = NextResponse.json(
      {
        totalRecords: count,
        results: requests.length,
        status: "success",
        data: requests,
        summary: statusSummary, // <-- Add
      },
      { status: 200 }
    );

    return response;
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

const ticketCreateBodySchema = ticketFormSchema.partial({
  // The route resolves property/unit from the verified user when omitted,
  // so they are optional in the wire schema even though the form requires them.
  property: true,
  unit: true,
  images: true,
  videos: true,
  documents: true,
});

export async function POST(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_CREATE);

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    const body = parseOrThrow(ticketCreateBodySchema, await request.json());
    const businessId = user.currentBusiness;

    if (body.relatedTo) {
      if (!mongoose.Types.ObjectId.isValid(body.relatedTo)) {
        throw ApiError.badRequest("Invalid related ticket");
      }

      const relatedTicket = await Ticket.findOne({
        _id: body.relatedTo,
        business: businessId,
      }).select("_id");

      if (!relatedTicket) {
        throw ApiError.badRequest("Related ticket not found");
      }
    }

    const propertyId = verify.isUserRole ? verify.property : body.property;
    const unitId = verify.isUserRole ? verify.unit : body.unit;

    if (!propertyId || !unitId) {
      throw ApiError.badRequest("Property and unit are required");
    }

    const unit = await Unit.findOne({
      _id: unitId,
      property: propertyId,
      business: businessId,
      isActive: true,
    }).select("tenantUser tenantActive");

    if (!unit) {
      throw ApiError.badRequest("Selected unit was not found in this workspace");
    }

    const requesterId = verify.isUserRole ? verify.id : unit.tenantUser;
    if (!requesterId || (!verify.isUserRole && !unit.tenantActive)) {
      throw ApiError.badRequest("Selected unit has no active tenant");
    }

    const data = await Ticket.create({
      ...body,
      relatedTo: body.relatedTo || undefined,
      property: propertyId,
      unit: unitId,
      user: requesterId,
      actionedBy: verify.isUserRole ? undefined : verify.id,
      business: businessId,
    });

    await TicketActivity.create({
      ticket: data.id,
      action: "created",
      description: `Ticket created with title: "${data.title}"`,
      changedBy: user.id,
      metadata: {
        field: "user",
        previous: null,
        current: requesterId,
        createdBy: verify.id,
      },
    });

    return NextResponse.json({ status: "success", data }, { status: 201 });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
