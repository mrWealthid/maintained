import { redirect } from "next/navigation";

import { connect } from "@/dbConfig/dbConfig";
import {
  getVerifiedUserState,
  VERIFIED_USER_STATE_STATUS,
} from "./getVerifiedUser";
import User from "@/models/userModel";
import Tradesperson, {
  type ITradesperson,
} from "@/models/tradespersonModel";
import { ACCOUNT_KIND } from "@/shared/enums/account-kind";

export type TradeAccessContext = {
  /** Verified User record (with accountKind === 'trade'). */
  userId: string;
  email: string;
  name: string;
  /** Resolved Tradesperson profile for this user (always present). */
  tradesperson: ITradesperson;
};

/**
 * Page-level guard for `/trades/*` routes. Asserts the visitor is a
 * `trade` account with a `Tradesperson` profile and redirects otherwise:
 *
 *   - unauthenticated         → /auth/login?next=…
 *   - manager (or unset kind) → /dashboard           (this isn't their dashboard)
 *   - trade w/o profile       → /trades/signup       (data integrity fallback)
 *
 * Onboarding gating happens in the /trades layout — this only validates
 * identity. Mirrors `requireDashboardAccess` for the manager side.
 */
export async function requireTradeAccess(args?: {
  nextPath?: string;
}): Promise<TradeAccessContext> {
  const state = await getVerifiedUserState();

  if (state.status === VERIFIED_USER_STATE_STATUS.UNAUTHENTICATED) {
    const next = args?.nextPath ?? "/trades";
    redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  // INACTIVE_BUSINESS is a workspace-side concern, not a trade-side one.
  // We treat any other non-AUTHORIZED status the same as unauthenticated.
  if (state.status !== VERIFIED_USER_STATE_STATUS.AUTHORIZED) {
    redirect(`/auth/login?next=${encodeURIComponent(args?.nextPath ?? "/trades")}`);
  }

  await connect();

  const user = await User.findById(state.user.id)
    .select("name email accountKind")
    .lean<{ _id: unknown; name?: string; email?: string; accountKind?: string }>();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.accountKind !== ACCOUNT_KIND.TRADE) {
    // A manager who's accidentally on a /trades URL goes back to their dashboard.
    redirect("/dashboard");
  }

  const tradesperson = await Tradesperson.findOne({ userId: state.user.id });
  if (!tradesperson) {
    // A trade user with no profile shouldn't be possible (signup creates both
    // in a single request), but if data drifts we bounce to signup rather than
    // crashing the dashboard. Canonical signup URL is /auth/signup?kind=trade.
    redirect("/auth/signup?kind=trade");
  }

  return {
    userId: state.user.id,
    email: user.email ?? "",
    name: user.name ?? "",
    tradesperson: tradesperson as ITradesperson,
  };
}
