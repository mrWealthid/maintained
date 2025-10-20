import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import TicketType from "@/models/ticketTypeModel";
import { ROLES } from "@/app/shared/enums/enums";

connect();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ typeId: string }> }
) {
  try {
    const verify = await getUserFromCookies();

    if (!verify) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (verify.role !== ROLES.admin && verify.role !== ROLES.super_admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { name, description, isActive } = await request.json();
    const { typeId } = await params;

    const ticketType = await TicketType.findByIdAndUpdate(
      typeId,
      { name, description, isActive },
      { new: true }
    );

    if (!ticketType) {
      return NextResponse.json(
        { error: "Ticket type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Ticket type updated successfully",
      data: ticketType,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
