import { redirect } from "next/navigation";

import {
  getVerifiedUserState,
  VERIFIED_USER_STATE_STATUS,
} from "@/lib/auth/getVerifiedUser";
import { isPlatformSuperAdminRole } from "@/shared/auth/roles";
import Business from "@/models/businessModel";
import Property from "@/models/propertyModel";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import OnboardingWizard, {
  type ResumeState,
} from "@/features/onboarding/wizard/OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const verifyState = await getVerifiedUserState();

  if (verifyState.status === VERIFIED_USER_STATE_STATUS.INACTIVE_BUSINESS) {
    redirect("/auth/inactive-business");
  }

  if (verifyState.status !== VERIFIED_USER_STATE_STATUS.AUTHORIZED) {
    redirect(`/auth/session-expired?next=${encodeURIComponent("/onboarding")}`);
  }

  const verify = verifyState.user;

  // Onboarding is a tenant-workspace concept; platform admins skip it.
  if (isPlatformSuperAdminRole(verify.platformRole)) redirect("/dashboard");

  const [business, user] = await Promise.all([
    Business.findById(verify.businessId)
      .select("name workspaceType onboardingCompletedAt")
      .lean<{
        name?: string;
        workspaceType?: "BUSINESS" | "INDIVIDUAL";
        onboardingCompletedAt?: Date | null;
      } | null>(),
    User.findById(verify.id).select("name").lean<{ name?: string } | null>(),
  ]);

  if (business?.onboardingCompletedAt) redirect("/dashboard");

  // Resume: pick up where the owner left off if they reload mid-flow.
  const latestProperty = await Property.findOne({
    business: verify.businessId,
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .select("_id name type")
    .lean<{ _id: unknown; name: string; type: "HOUSE" | "BUILDING" | "STATION" } | null>();

  let resume: ResumeState | null = null;
  if (latestProperty) {
    const unitsCount =
      latestProperty.type === "HOUSE"
        ? 1
        : await Unit.countDocuments({
            business: verify.businessId,
            property: latestProperty._id,
            isActive: true,
          });

    resume = {
      property: {
        id: String(latestProperty._id),
        name: latestProperty.name,
        type: latestProperty.type,
      },
      unitsCount,
    };
  }

  return (
    <OnboardingWizard
      workspaceName={business?.name ?? "your workspace"}
      workspaceType={business?.workspaceType ?? "BUSINESS"}
      ownerFirstName={(user?.name ?? "").split(" ")[0] || null}
      resume={resume}
    />
  );
}
