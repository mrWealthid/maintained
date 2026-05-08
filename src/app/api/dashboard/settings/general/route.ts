import { connect } from "@/dbConfig/dbConfig";
import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import {
  assertWorkspacePermissionKey,
  hasWorkspacePermissionKey,
} from "@/lib/auth/permission-guards";
import {
  ApiError,
  errorToNextResponse,
  parseOrThrow,
} from "@/lib/errors/apiError";
import { normalizeTimeZone } from "@/lib/date/timezone-options";
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { WORKSPACE_TYPE } from "@/shared/model/workspace.model";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

connect();

const integrationStateSchema = z.object({
  connected: z.boolean().optional().default(false),
});

const generalSchema = z.object({
  timezone: z.string().optional(),
  dateFormat: z.enum(["mdy", "dmy", "ymd"]).optional().default("mdy"),
  timeFormat: z.enum(["12h", "24h"]).optional().default("12h"),
  language: z.enum(["en", "es", "fr", "de", "pt"]).optional().default("en"),
  integrations: z
    .object({
      googleCalendar: integrationStateSchema.optional(),
      slack: integrationStateSchema.optional(),
      mailchimp: integrationStateSchema.optional(),
      zapier: integrationStateSchema.optional(),
    })
    .optional()
    .default({}),
});

const addressStructuredSchema = z
  .object({
    line1: z.string().trim().optional().default(""),
    line2: z.string().trim().optional().default(""),
    city: z.string().trim().optional().default(""),
    state: z.string().trim().optional().default(""),
    postalCode: z.string().trim().optional().default(""),
    countryCode: z.string().trim().optional().default("US"),
    country: z.string().trim().optional().default("United States"),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
    placeId: z.string().trim().optional().default(""),
    source: z.enum(["google", "manual"]).optional().default("manual"),
  })
  .passthrough();

const updateGeneralSettingsSchema = z.object({
  personalProfile: z
    .object({
      name: z.string().trim().min(2).max(120),
      contact: z.string().trim().max(40).optional().default(""),
      countryCode: z.string().trim().max(4).optional().default("US"),
    })
    .optional(),
  business: z
    .object({
      name: z.string().trim().min(2).max(160).optional(),
      logo: z.string().trim().optional(),
      description: z.string().trim().optional().default(""),
      addressStructured: addressStructuredSchema.optional(),
    })
    .optional(),
  settings: z
    .object({
      general: generalSchema.optional(),
    })
    .optional(),
});

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id");
}

function mergeGeneralSettings(general?: {
  timezone?: string;
  dateFormat?: "mdy" | "dmy" | "ymd";
  timeFormat?: "12h" | "24h";
  language?: "en" | "es" | "fr" | "de" | "pt";
  integrations?: {
    googleCalendar?: { connected?: boolean };
    slack?: { connected?: boolean };
    mailchimp?: { connected?: boolean };
    zapier?: { connected?: boolean };
  };
} | null) {
  return {
    timezone: normalizeTimeZone(general?.timezone),
    dateFormat: general?.dateFormat ?? "mdy",
    timeFormat: general?.timeFormat ?? "12h",
    language: general?.language ?? "en",
    integrations: {
      googleCalendar: {
        connected: general?.integrations?.googleCalendar?.connected ?? false,
      },
      slack: { connected: general?.integrations?.slack?.connected ?? false },
      mailchimp: {
        connected: general?.integrations?.mailchimp?.connected ?? false,
      },
      zapier: { connected: general?.integrations?.zapier?.connected ?? false },
    },
  };
}

function isSameId(left: unknown, right: unknown) {
  return String(left ?? "") === String(right ?? "");
}

function isCompleteAddress(address?: z.infer<typeof addressStructuredSchema>) {
  return Boolean(
    address?.line1 && address.city && address.state && address.postalCode,
  );
}

async function buildResponseData(verify: Awaited<ReturnType<typeof getVerifiedUser>>) {
  if (!verify) throw ApiError.unauthorized();

  const [user, business] = await Promise.all([
    User.findById(verify.id).select("name email contact countryCode"),
    Business.findById(verify.businessId).select(
      "name email contact countryCode logo description addressStructured workspaceType creator owner settings.general",
    ),
  ]);

  if (!user) throw ApiError.notFound("User not found");
  if (!business) throw ApiError.notFound("Workspace not found");

  const isBusinessCreator =
    isSameId(business.creator, verify.id) || isSameId(business.owner, verify.id);
  const canEditBusinessDetails =
    isBusinessCreator ||
    (await hasWorkspacePermissionKey(verify, PERMISSION.SETTINGS_PROFILE_MANAGE));

  return {
    personalProfile: {
      name: user.name ?? "",
      email: user.email ?? "",
      contact: user.contact ?? "",
      countryCode: user.countryCode ?? business.countryCode ?? "US",
    },
    business: {
      name: business.name ?? "",
      email: business.email ?? "",
      contact: business.contact ?? "",
      countryCode: business.countryCode ?? "US",
      logo: business.logo ?? "",
      description: business.description ?? "",
      workspaceType: business.workspaceType ?? WORKSPACE_TYPE.BUSINESS,
      addressStructured: business.addressStructured ?? {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        countryCode: "US",
        country: "United States",
        placeId: "",
        source: "manual",
      },
    },
    settings: {
      general: mergeGeneralSettings(business.settings?.general),
    },
    meta: {
      permissions: {
        isBusinessCreator,
        canEditBusinessDetails,
      },
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    await assertWorkspacePermissionKey(verify, PERMISSION.SETTINGS_VIEW);

    return NextResponse.json({
      status: "success",
      data: await buildResponseData(verify),
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verify = await getVerifiedUser(request);
    if (!verify) throw ApiError.unauthorized();
    await assertWorkspacePermissionKey(verify, PERMISSION.SETTINGS_VIEW);

    const payload = parseOrThrow(
      updateGeneralSettingsSchema,
      await request.json(),
    );

    if (payload.personalProfile) {
      await User.findByIdAndUpdate(
        verify.id,
        {
          name: payload.personalProfile.name,
          contact: payload.personalProfile.contact,
          countryCode: payload.personalProfile.countryCode,
        },
        { runValidators: true },
      );
    }

    const business = await Business.findById(verify.businessId).select(
      "creator owner settings.general",
    );
    if (!business) throw ApiError.notFound("Workspace not found");

    const isBusinessCreator =
      isSameId(business.creator, verify.id) || isSameId(business.owner, verify.id);
  const canEditBusinessDetails =
    isBusinessCreator ||
      (await hasWorkspacePermissionKey(verify, PERMISSION.SETTINGS_PROFILE_MANAGE));

    const businessUpdate: Record<string, unknown> = {};
    if (payload.business && canEditBusinessDetails) {
      if (payload.business.name !== undefined) businessUpdate.name = payload.business.name;
      if (payload.business.logo !== undefined) businessUpdate.logo = payload.business.logo;
      if (payload.business.description !== undefined) {
        businessUpdate.description = payload.business.description;
      }
      if (isCompleteAddress(payload.business.addressStructured)) {
        businessUpdate.addressStructured = payload.business.addressStructured;
      }
    }

    if (payload.settings?.general) {
      businessUpdate["settings.general"] = {
        ...mergeGeneralSettings(business.settings?.general),
        ...payload.settings.general,
        timezone: normalizeTimeZone(payload.settings.general.timezone),
        integrations: {
          ...mergeGeneralSettings(business.settings?.general).integrations,
          ...payload.settings.general.integrations,
        },
      };
    }

    if (Object.keys(businessUpdate).length > 0) {
      await Business.findByIdAndUpdate(verify.businessId, businessUpdate, {
        runValidators: true,
      });
    }

    return NextResponse.json({
      status: "success",
      message: "General settings saved",
      data: await buildResponseData(verify),
    });
  } catch (error) {
    return errorToNextResponse(error, getRequestId(request));
  }
}
