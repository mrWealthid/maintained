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
import { ensureDefaultTicketTypes } from "@/lib/tickets/default-ticket-type";

const ticketTypeBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
});

async function requirePlatformSettings(
  request: NextRequest,
  permission:
    | typeof PERMISSION.PLATFORM_SETTINGS_VIEW
    | typeof PERMISSION.PLATFORM_SETTINGS_MANAGE,
) {
  const verify = await getVerifiedUser(request);
  if (!verify) throw ApiError.unauthorized();
  await assertPermission(
    {
      userId: verify.id,
      businessId: verify.businessId,
      platformRole: verify.platformRole,
      workspaceRole: verify.workspaceRole,
    },
    permission,
  );
  return verify;
}

export async function GET(request: NextRequest) {
  try {
    await connect();
    await requirePlatformSettings(request, PERMISSION.PLATFORM_SETTINGS_VIEW);
    await ensureDefaultTicketTypes();

    const ticketTypes = await TicketType.find({
      $or: [{ business: null }, { business: { $exists: false } }],
    }).sort({ isSystem: -1, name: 1 });

    return NextResponse.json({ status: "success", data: ticketTypes });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    await requirePlatformSettings(request, PERMISSION.PLATFORM_SETTINGS_MANAGE);

    const { name, description } = parseOrThrow(
      ticketTypeBodySchema,
      await request.json(),
    );

    const data = await TicketType.create({
      name,
      description,
      business: null,
      isDefault: true,
      isSystem: false,
    });

    return NextResponse.json({ status: "success", data }, { status: 201 });
  } catch (error) {
    return errorToNextResponse(error, request.headers.get("x-request-id"));
  }
}
