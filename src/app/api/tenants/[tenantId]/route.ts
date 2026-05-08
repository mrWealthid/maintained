import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { assertWorkspacePermissionKey } from "@/lib/auth/permission-guards";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import WorkspaceMembership from "@/models/workspaceMembershipModel";
import { tenantInviteFormSchema } from "@/features/tenants/models/tenant-form.model";
import { MEMBERSHIP_STATUS, USER_TYPE } from "@/shared/auth/roles";
import { PERMISSION } from "@/shared/auth/permission-registry";

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

function objectId(value: string) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw ApiError.badRequest("Invalid identifier");
  }
  return new mongoose.Types.ObjectId(value);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    await assertWorkspacePermissionKey(verify, PERMISSION.TENANTS_VIEW);

    const { tenantId } = await params;
    const membership = await WorkspaceMembership.findOne({
      workspace: verify.businessId,
      user: objectId(tenantId),
      role: USER_TYPE.tenant,
      status: MEMBERSHIP_STATUS.active,
    })
      .populate({ path: "user", select: "name email active" })
      .populate({ path: "property", select: "name" })
      .populate({ path: "unit", select: "label tenantActive" });

    if (!membership) throw ApiError.notFound("Tenant not found");

    return NextResponse.json({
      status: "success",
      data: membership,
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    await assertWorkspacePermissionKey(verify, PERMISSION.TENANTS_MANAGE);
    await assertWorkspacePermissionKey(verify, PERMISSION.UNITS_TENANT_ASSIGN);

    const { tenantId } = await params;
    const body = parseOrThrow(
      tenantInviteFormSchema.partial({ name: true, email: true, accessibleUnits: true }),
      await request.json(),
    );
    const tenantObjectId = objectId(tenantId);

    const membership = await WorkspaceMembership.findOne({
      workspace: verify.businessId,
      user: tenantObjectId,
      role: USER_TYPE.tenant,
      status: MEMBERSHIP_STATUS.active,
    });
    if (!membership) throw ApiError.notFound("Tenant not found");

    if (body.name || body.email) {
      await User.findByIdAndUpdate(tenantObjectId, {
        ...(body.name ? { name: body.name } : {}),
        ...(body.email ? { email: body.email } : {}),
      });
    }

    if (body.property && body.unit) {
      const propertyId = objectId(body.property);
      const unitId = objectId(body.unit);
      const unit = await Unit.findOne({
        _id: unitId,
        property: propertyId,
        business: verify.businessId,
        isActive: true,
      }).select("tenantActive tenantUser");

      if (!unit) throw ApiError.badRequest("Selected unit was not found");
      if (
        unit.tenantUser &&
        unit.tenantUser.toString() !== tenantObjectId.toString()
      ) {
        throw ApiError.badRequest("Selected unit already has an active tenant");
      }

      await Unit.updateMany(
        {
          business: verify.businessId,
          tenantUser: tenantObjectId,
        },
        {
          $set: { tenantActive: false },
          $unset: { tenantUser: "" },
        },
      );

      await Unit.findByIdAndUpdate(unitId, {
        $set: {
          tenantUser: tenantObjectId,
          tenantActive: true,
        },
        $push: {
          tenants: {
            user: tenantObjectId,
            start: new Date(),
          },
        },
      });

      membership.property = propertyId;
      membership.unit = unitId;
      await membership.save();
    }

    return NextResponse.json({
      status: "success",
      message: "Tenant updated",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  try {
    await connect();
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    await assertWorkspacePermissionKey(verify, PERMISSION.TENANTS_REMOVE);

    const { tenantId } = await params;
    const tenantObjectId = objectId(tenantId);
    const membership = await WorkspaceMembership.findOneAndDelete({
      workspace: verify.businessId,
      user: tenantObjectId,
      role: USER_TYPE.tenant,
    });
    if (!membership) throw ApiError.notFound("Tenant not found");

    await Unit.updateMany(
      {
        business: verify.businessId,
        tenantUser: tenantObjectId,
      },
      {
        $set: { tenantActive: false, "tenants.$[tenant].end": new Date() },
        $unset: { tenantUser: "" },
      },
      {
        arrayFilters: [{ "tenant.user": tenantObjectId, "tenant.end": { $exists: false } }],
      },
    );

    return NextResponse.json({
      status: "success",
      message: "Tenant removed",
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
