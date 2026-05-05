import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertPermission } from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { PERMISSION } from "@/shared/auth/permission-registry";
import TicketType from "@/models/ticketTypeModel";

const ticketTypeUpdateBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

async function requirePlatformManage(request: NextRequest) {
  const verify = await getVerifiedUser(request);
  if (!verify) throw ApiError.unauthorized();
  await assertPermission(
    {
      userId: verify.id,
      businessId: verify.businessId,
      platformRole: verify.platformRole,
      workspaceRole: verify.workspaceRole,
    },
    PERMISSION.PLATFORM_SETTINGS_MANAGE,
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ticketTypeId: string }> },
) {
  try {
    await connect();
    await requirePlatformManage(request);

    const { name, description, isActive } = parseOrThrow(
      ticketTypeUpdateBodySchema,
      await request.json(),
    );
    const { ticketTypeId } = await params;

    const existing = await TicketType.findById(ticketTypeId);
    if (!existing) throw ApiError.notFound("Ticket type not found");
    if (existing.business) {
      throw ApiError.badRequest("Not a platform-wide ticket type");
    }

    const ticketType = await TicketType.findByIdAndUpdate(
      ticketTypeId,
      { name, description, isActive },
      { new: true },
    );

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
  { params }: { params: Promise<{ ticketTypeId: string }> },
) {
  try {
    await connect();
    await requirePlatformManage(request);

    const { ticketTypeId } = await params;

    const ticketType = await TicketType.findById(ticketTypeId);
    if (!ticketType) throw ApiError.notFound("Ticket type not found");
    if (ticketType.business) {
      throw ApiError.badRequest("Not a platform-wide ticket type");
    }

    await TicketType.findByIdAndDelete(ticketTypeId);

    return NextResponse.json({
      status: "success",
      message: "Ticket type deleted successfully",
    });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
