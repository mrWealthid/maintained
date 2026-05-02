import { isPlatformSuperAdminRole } from "@/shared/auth/roles";
import { ROLES } from "@/shared/enums/enums";

export function isSuperAdminRole(role?: ROLES | string | null) {
  return isPlatformSuperAdminRole(role);
}
