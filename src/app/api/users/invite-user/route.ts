import { INVITE_STATUS } from "@/app/shared/enums/enums";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import { Emails } from "@/utils/email-resend";
import { generateInviteToken } from "@/utils/helpers";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const verify = await getUserFromCookies();

  try {
    if (!verify?.isAdminRole) {
      return NextResponse.json(
        { error: "User is not authorized" },
        { status: 401 }
      );
    }

    const currentBusinessId = verify.currentBusiness;

    if (!currentBusinessId) {
      return NextResponse.json(
        { error: "No current business context" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if it's bulk creation or single creation
    const isBulk = Array.isArray(body);
    const usersData = isBulk ? body : [body];

    // Validate all users data
    for (const userData of usersData) {
      const { name, email, role } = userData;
      if (!name || !email || !role) {
        return NextResponse.json(
          { error: "name, email, and role are required for each user" },
          { status: 400 }
        );
      }
    }

    const capitalize = (str: string) =>
      str.replace(/\b\w/g, (char) => char.toUpperCase());

    // const activeBusiness = await Business.findById(currentBusinessId);
    const results = [];
    const errors = [];

    // Process each user
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];

      try {
        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
          const alreadyMember = existingUser.memberships.some(
            (m) => m.business.toString() === currentBusinessId.toString()
          );

          if (alreadyMember) {
            errors.push({
              index: i,
              email: userData.email,
              error: "User already belongs to this business",
            });
            continue;
          }

          const businessObjectId = new mongoose.Types.ObjectId(
            currentBusinessId
          );
          const { token, hashed, expires } = generateInviteToken();

          // Append the new membership
          existingUser.memberships.push({
            business: businessObjectId,
            role: userData.role,
            status: INVITE_STATUS.invited,
            inviteToken: hashed,
            inviteTokenExpires: expires,
            specialties: userData.specialties || [],
            property: userData.propertyId,
            unit: userData.unitId,
            isCreator: false,
          });

          // Optional: only update currentBusiness if none is set
          if (!existingUser.currentBusiness) {
            existingUser.currentBusiness = businessObjectId;
          }

          await existingUser.save({ validateBeforeSave: false });

          // Construct invite URL
          const inviteURL =
            process.env.NODE_ENV === "development"
              ? `${process.env.DEVELOPMENT_URL}/auth/onboard-user/${token}`
              : `${process.env.PRODUCTION_URL}/auth/onboard-user/${token}`;

          // Send invite email
          await new Emails(
            existingUser,
            inviteURL,
            verify.currentBusinessName
          ).sendInviteUser();

          results.push({
            email: userData.email,
            status: "success",
            url: inviteURL,
          });
        } else {
          // New user
          const { token, hashed, expires } = generateInviteToken();

          const newUser = new User({
            name: capitalize(userData.name),
            email: userData.email,
            dateOfBirth: userData.dateOfBirth,
            memberships: [
              {
                business: currentBusinessId,
                role: userData.role,
                status: INVITE_STATUS.invited,
                inviteToken: hashed,
                inviteTokenExpires: expires,
                specialties: userData.specialties || [],
                property: userData.propertyId,
                unit: userData.unitId,
              },
            ],
            currentBusiness: currentBusinessId,
          });

          await newUser.save({ validateBeforeSave: false });

          // Construct invite URL
          const inviteURL =
            process.env.NODE_ENV === "development"
              ? `${process.env.DEVELOPMENT_URL}/auth/onboard-user/${token}`
              : `${process.env.PRODUCTION_URL}/auth/onboard-user/${token}`;

          // Send invite email
          await new Emails(
            newUser,
            verify.currentBusinessName,
            inviteURL
          ).sendInviteUser();

          results.push({
            email: userData.email,
            status: "success",
            url: inviteURL,
          });
        }
      } catch (error: any) {
        errors.push({
          index: i,
          email: userData.email,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      status: "success",
      data: isBulk ? results : results[0],
      count: results.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("[INVITE_USER_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const verify = await getUserFromCookies();

  try {
    // 1) Must be admin
    if (!verify?.isAdminRole) {
      return NextResponse.json(
        { error: "User is not authorized" },
        { status: 401 }
      );
    }

    const currentBusinessId = verify.currentBusiness;
    if (!currentBusinessId) {
      return NextResponse.json(
        { error: "No current business context" },
        { status: 400 }
      );
    }

    // 2) Input
    const body = await request.json();
    const { email, force = false } = body as { email: string; force?: boolean };
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 3) Ensure business exists (optional but nice for safety)
    // const activeBusiness = await Business.findById(currentBusinessId);
    // if (!activeBusiness) {
    //   return NextResponse.json(
    //     { error: "Business not found" },
    //     { status: 404 }
    //   );
    // }

    // 4) Find the user and their membership for this business
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const businessIdStr = String(currentBusinessId);
    const membershipIndex = user.memberships.findIndex(
      (m: any) => String(m.business) === businessIdStr
    );

    if (membershipIndex === -1) {
      return NextResponse.json(
        { error: "User does not have a membership with this business" },
        { status: 400 }
      );
    }

    const membership = user.memberships[membershipIndex];

    // 5) Block re-invite if already activated
    if (membership.status === INVITE_STATUS.activated) {
      return NextResponse.json(
        { error: "User is already activated for this business" },
        { status: 400 }
      );
    }

    // 6) Check expiry logic
    const now = new Date();
    const hasExpiry =
      membership.inviteTokenExpires !== undefined &&
      membership.inviteTokenExpires !== null;
    const isExpired = hasExpiry
      ? now > new Date(membership.inviteTokenExpires as string | number | Date)
      : true;

    if (!isExpired && !force) {
      // Invite still valid → do not rotate unless explicitly forced
      return NextResponse.json(
        {
          error: "Existing invite token is still valid",
          expiresAt: membership.inviteTokenExpires,
        },
        { status: 400 }
      );
    }

    // 7) Generate a fresh token and update membership
    const { token, hashed, expires } = generateInviteToken();

    membership.inviteToken = hashed;
    membership.inviteTokenExpires = expires;
    membership.status = INVITE_STATUS.invited;

    // (Optional) ensure currentBusiness is set
    if (!user.currentBusiness) {
      user.currentBusiness = new mongoose.Types.ObjectId(currentBusinessId);
    }

    await user.save({ validateBeforeSave: false });

    // 8) Build invite URL using the *plain* token (not hashed)
    const inviteURL =
      process.env.NODE_ENV === "development"
        ? `${process.env.DEVELOPMENT_URL}/auth/onboard-user/${token}`
        : `${process.env.PRODUCTION_URL}/auth/onboard-user/${token}`;

    // 9) Send the invite email
    await new Emails(
      user,
      verify.currentBusinessName,
      inviteURL
    ).sendInviteUser();

    return NextResponse.json({
      status: "success",
      message: "Invite re-sent successfully",
      url: inviteURL,
      expiresAt: expires,
    });
  } catch (error: any) {
    console.error("[REINVITE_USER_ERROR]", error);
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}
