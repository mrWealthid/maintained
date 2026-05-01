import "server-only";

import type { VerifiedUser } from "@/lib/auth/getVerifiedUser";
import { getBusinessSecuritySettings } from "@/lib/security/business-security";

export async function getSessionTimeoutMinutesForVerifiedUser(
  user: Pick<VerifiedUser, "businessId">,
) {
  const securitySettings = await getBusinessSecuritySettings(user.businessId);
  return securitySettings.sessionTimeoutMinutes;
}
