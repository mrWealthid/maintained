import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import TicketType from "@/models/ticketTypeModel";
import { z } from "zod";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";
import mongoose from "mongoose";

connect();

const ticketTypeUpdateBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ typeId: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKET_TYPES_MANAGE);

    const { name, description, isActive } = parseOrThrow(
      ticketTypeUpdateBodySchema,
      await request.json()
    );
    const { typeId } = await params;

    const ticketType = await TicketType.findOneAndUpdate(
      {
        _id: typeId,
        business: new mongoose.Types.ObjectId(String(verify.currentBusiness)),
        isDefault: { $ne: true },
      },
      { name, description, isActive },
      { new: true },
    );

    if (!ticketType) throw ApiError.notFound("Ticket type not found");

    return NextResponse.json({
      status: "success",
      message: "Ticket type updated successfully",
      data: ticketType,
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ typeId: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    await assertLegacyWorkspacePermission(verify, PERMISSION.TICKET_TYPES_MANAGE);

    const { typeId } = await params;

    const ticketType = await TicketType.findOne({
      _id: typeId,
      business: new mongoose.Types.ObjectId(String(verify.currentBusiness)),
    });
    if (!ticketType) throw ApiError.notFound("Ticket type not found");
    if (ticketType.isDefault) {
      throw ApiError.badRequest("Cannot delete default ticket types");
    }

    await TicketType.findByIdAndDelete(typeId);

    return NextResponse.json({
      status: "success",
      message: "Ticket type deleted successfully",
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
