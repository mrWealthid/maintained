import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import Ticket from "@/models/ticketModel";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { TICKET_STATUS } from "@/shared/enums/enums";

const BulkTicketActionSchema = z
  .object({
    action: z.enum(["delete", "assign-self", "decline"]),
    ticketIds: z.array(z.string().min(1)).min(1),
  })
  .strict();

type BulkTicketActionInput = z.infer<typeof BulkTicketActionSchema>;

export async function POST(request: NextRequest) {
  try {
    const verify = await getUserFromCookies(request);
    if (!verify) throw ApiError.unauthorized();

    const dto = parseOrThrow(
      BulkTicketActionSchema,
      await request.json(),
    ) as BulkTicketActionInput;

    const uniqueIds = Array.from(new Set(dto.ticketIds));
    const invalidId = uniqueIds.find(
      (id) => !mongoose.Types.ObjectId.isValid(id),
    );
    if (invalidId) {
      throw ApiError.badRequest("Invalid ticket id in selection");
    }

    if (dto.action === "delete") {
      await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_DELETE);
      const result = await Ticket.deleteMany({ _id: { $in: uniqueIds } });
      return NextResponse.json({
        success: true,
        data: {
          action: dto.action,
          deletedCount: result.deletedCount ?? 0,
        },
      });
    }

    if (dto.action === "assign-self") {
      await assertLegacyWorkspacePermission(verify, PERMISSION.TICKETS_ASSIGN);
      const result = await Ticket.updateMany(
        { _id: { $in: uniqueIds } },
        {
          $set: {
            actionedBy: verify.id,
            status: TICKET_STATUS.processing,
          },
        },
      );
      return NextResponse.json({
        success: true,
        data: {
          action: dto.action,
          modifiedCount: result.modifiedCount ?? 0,
        },
      });
    }

    if (dto.action === "decline") {
      await assertLegacyWorkspacePermission(
        verify,
        PERMISSION.TICKETS_STATUS_MANAGE,
      );
      const result = await Ticket.updateMany(
        { _id: { $in: uniqueIds } },
        { $set: { status: TICKET_STATUS.declined } },
      );
      return NextResponse.json({
        success: true,
        data: {
          action: dto.action,
          modifiedCount: result.modifiedCount ?? 0,
        },
      });
    }

    throw ApiError.badRequest("Unsupported bulk action");
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
