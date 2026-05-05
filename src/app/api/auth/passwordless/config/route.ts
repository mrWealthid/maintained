import { NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { errorToNextResponse } from "@/lib/errors/apiError";
import { getAppSecuritySettings } from "@/lib/security/app-security";

export async function GET() {
  try {
    await connect();
    const appSecuritySettings = await getAppSecuritySettings();

    return NextResponse.json({
      status: "success",
      data: {
        enabled: appSecuritySettings.passwordlessLogin,
      },
    });
  } catch (error) {
    return errorToNextResponse(error);
  }
}
