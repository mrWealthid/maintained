import { NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import { errorToNextResponse } from "@/lib/errors/apiError";
import { getAppPasswordPolicy } from "@/lib/security/password-policy";

export async function GET() {
  try {
    await connect();
    return NextResponse.json({
      status: "success",
      data: await getAppPasswordPolicy(),
    });
  } catch (error) {
    return errorToNextResponse(error);
  }
}
