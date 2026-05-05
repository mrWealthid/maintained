import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { ApiError } from "@/lib/errors/apiError";
import { ROLES } from "@/shared/enums/enums";
import { buildAuthRedirectResponse } from "@/lib/auth/issue-auth-session";
import {
  buildPasswordlessLoginRedirectPath,
  getSafePasswordlessNextPath,
  hashPasswordlessLoginToken,
  PASSWORDLESS_LOGIN_QUERY_PARAM,
  PASSWORDLESS_LOGIN_STATUS,
} from "@/lib/auth/passwordless";
import { getAppSecuritySettings } from "@/lib/security/app-security";
import {
  getAppPasswordPolicy,
  isPasswordExpired,
} from "@/lib/security/password-policy";
import {
  getBusinessSecuritySettings,
  isIpAllowed,
} from "@/lib/security/business-security";
import { getRequestSecurityContext } from "@/lib/security/request-context";

function redirectToLogin(
  request: NextRequest,
  status: (typeof PASSWORDLESS_LOGIN_STATUS)[keyof typeof PASSWORDLESS_LOGIN_STATUS]
) {
  return NextResponse.redirect(
    new URL(buildPasswordlessLoginRedirectPath(status), request.url)
  );
}

export async function GET(request: NextRequest) {
  try {
    await connect();

    const token = request.nextUrl.searchParams.get(
      PASSWORDLESS_LOGIN_QUERY_PARAM.TOKEN
    );
    const nextPath = getSafePasswordlessNextPath(
      request.nextUrl.searchParams.get(PASSWORDLESS_LOGIN_QUERY_PARAM.NEXT)
    );

    if (!token) {
      return redirectToLogin(request, PASSWORDLESS_LOGIN_STATUS.INVALID_LINK);
    }

    const user = await User.findOne({
      passwordlessLoginToken: hashPasswordlessLoginToken(token),
      passwordlessLoginExpires: { $gt: new Date() },
    }).select(
      "name email memberships currentBusiness createdAt passwordChangedAt +passwordlessLoginToken +passwordlessLoginExpires"
    );

    if (!user) {
      return redirectToLogin(request, PASSWORDLESS_LOGIN_STATUS.INVALID_LINK);
    }

    const currentMembership = user.memberships.find(
      (m) => m.business.toString() === user.currentBusiness?.toString()
    );

    if (!currentMembership || currentMembership.role === ROLES.super_admin) {
      return redirectToLogin(request, PASSWORDLESS_LOGIN_STATUS.DISABLED);
    }

    const [appSecuritySettings, passwordPolicy, securitySettings, requestContext] =
      await Promise.all([
        getAppSecuritySettings(),
        getAppPasswordPolicy(),
        getBusinessSecuritySettings(user.currentBusiness?.toString()),
        getRequestSecurityContext(request),
      ]);

    if (!appSecuritySettings.passwordlessLogin) {
      return redirectToLogin(request, PASSWORDLESS_LOGIN_STATUS.DISABLED);
    }

    if (
      isPasswordExpired({
        passwordChangedAt: user.passwordChangedAt,
        fallbackDate: user.createdAt,
        policy: passwordPolicy,
      })
    ) {
      return redirectToLogin(
        request,
        PASSWORDLESS_LOGIN_STATUS.PASSWORD_EXPIRED
      );
    }

    if (
      securitySettings.ipWhitelist.enabled &&
      !isIpAllowed({
        ipAddress: requestContext.ipAddress,
        ips: securitySettings.ipWhitelist.ips,
      })
    ) {
      return redirectToLogin(request, PASSWORDLESS_LOGIN_STATUS.IP_BLOCKED);
    }

    user.passwordlessLoginToken = undefined;
    user.passwordlessLoginExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return buildAuthRedirectResponse({
      request,
      user,
      maxActiveSessions: securitySettings.maxActiveSessions,
      redirectTo: nextPath,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return redirectToLogin(request, PASSWORDLESS_LOGIN_STATUS.DISABLED);
    }
    return redirectToLogin(request, PASSWORDLESS_LOGIN_STATUS.INVALID_LINK);
  }
}
