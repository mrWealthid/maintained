import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { ApiError, errorToNextResponse } from "@/lib/errors/apiError";
import TicketType from "@/models/ticketTypeModel";
import { ROLES } from "@/shared/enums/enums";

connect();

function assertTypeAdmin(role: string | undefined) {
  if (role !== ROLES.admin && role !== ROLES.super_admin) {
    throw ApiError.forbidden("Admin access required");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ typeId: string }> },
) {
  try {
    const verify = await getUserFromCookies();
    if (!verify) throw ApiError.unauthorized();
    assertTypeAdmin(verify.role);

    const { name, description, isActive } = await request.json();
    const { typeId } = await params;

    const ticketType = await TicketType.findByIdAndUpdate(
      typeId,
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
    assertTypeAdmin(verify.role);

    const { typeId } = await params;

    const ticketType = await TicketType.findById(typeId);
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
