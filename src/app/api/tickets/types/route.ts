import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import TicketType from "@/models/ticketTypeModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { z } from "zod";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

connect();

const ticketTypeBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
});

const ticketTypeListQuerySchema = z.object({
  name: z.string().trim().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKET_TYPES_VIEW);

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    const parsedQuery = parseOrThrow(
      ticketTypeListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    const businessIds = user.memberships.map((m) =>
      typeof m.business === "object" ? m.business._id : m.business,
    );

    let filter: Record<string, unknown> = {
      $or: [{ business: { $in: businessIds } }, { isDefault: true }],
    };

    if (parsedQuery.name) {
      const regex = new RegExp(parsedQuery.name, "i");
      filter = { ...filter, name: { $regex: regex } };
    }

    const results = await TicketType.find(filter);
    return NextResponse.json({ status: "success", data: results });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function POST(request: NextRequest) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKET_TYPES_MANAGE);

    const user = await User.findById(verify.id);
    if (!user) throw ApiError.notFound("User not found");

    const { name, description } = parseOrThrow(
      ticketTypeBodySchema,
      await request.json()
    );

    const data = await TicketType.create({
      name,
      description,
      business: new mongoose.Types.ObjectId(verify.currentBusiness),
      isDefault: false,
    });

    return NextResponse.json(
      { message: "Ticket type created successfully", status: "success", data },
      { status: 201 },
    );
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
