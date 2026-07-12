import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { connect } from "@/dbConfig/dbConfig";
import { PERMISSION } from "@/shared/auth/permission-registry";

import WorkspaceTrade from "@/models/workspaceTradeModel";
// Side-effect import: ensures the Tradesperson model is registered when
// this server component runs in isolation (populate('tradesperson') needs
// the ref to exist on the Mongoose connection).
import "@/models/tradespersonModel";
import { TECHNICIAN_SPECIALTY_LABELS } from "@/features/technicians/models/technician-specialty.model";
import { WORKSPACE_TRADE_STATUS } from "@/features/trades/models/trade-status.model";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InviteTradeForm from "@/features/trades/components/InviteTradeForm";

export const dynamic = "force-dynamic";

function statusTone(status: string) {
  switch (status) {
    case WORKSPACE_TRADE_STATUS.ACTIVE:
      return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-300";
    case WORKSPACE_TRADE_STATUS.SUSPENDED:
      return "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/40 dark:bg-rose-950/30 dark:text-rose-300";
    default:
      return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300";
  }
}

/**
 * Admin-side list of tradespeople the workspace has linked, plus an
 * invite form to add new ones. Lists each trade's specialties prominently
 * so admins know who they can route work to.
 */
export default async function DashboardTradesPage() {
  const verify = await requireDashboardAccess({
    requiredPermission: PERMISSION.TECHNICIAN_REQUESTS_VIEW,
  });
  await connect();

  const links = await WorkspaceTrade.find({ workspace: verify.businessId })
    .populate({
      path: "tradesperson",
      select: "businessName slug contactEmail contactPhone specialties verificationStatus isActive serviceAreaKm",
    })
    .sort({ updatedAt: -1 })
    .lean<
      Array<{
        _id: unknown;
        status: string;
        invitedEmail?: string;
        inviteTokenExpires?: Date;
        tradesperson?: {
          _id: unknown;
          businessName?: string;
          slug?: string;
          contactEmail?: string;
          contactPhone?: string;
          specialties?: string[];
          verificationStatus?: string;
          isActive?: boolean;
          serviceAreaKm?: number;
        };
      }>
    >();

  return (
    <main className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tradespeople</h1>
        <p className="text-sm text-muted-foreground">
          External trades linked to this workspace. Invite by email — the
          trade signs in to accept and starts seeing your repair broadcasts.
        </p>
      </div>

      <InviteTradeForm />

      {links.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No tradespeople linked yet. Invite one above to start routing
            repair requests externally.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {links.map((l) => {
            const t = l.tradesperson;
            const specialties = t?.specialties ?? [];
            return (
              <li key={String(l._id)}>
                <Card>
                  <CardHeader className="space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-base">
                          {t?.businessName ?? "Tradesperson"}
                        </CardTitle>
                        <CardDescription>
                          {t?.contactEmail ?? l.invitedEmail ?? ""}
                          {t?.contactPhone ? ` · ${t.contactPhone}` : ""}
                        </CardDescription>
                      </div>
                      <span
                        className={
                          "shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide " +
                          statusTone(l.status)
                        }
                      >
                        {l.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Specialties
                      </p>
                      {specialties.length ? (
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {specialties.map((s) => (
                            <li
                              key={s}
                              className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs"
                            >
                              {TECHNICIAN_SPECIALTY_LABELS[
                                s as keyof typeof TECHNICIAN_SPECIALTY_LABELS
                              ] ?? s}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No specialties on profile yet.
                        </p>
                      )}
                    </div>

                    {t?.serviceAreaKm ? (
                      <p className="text-xs text-muted-foreground">
                        Service area: ~{t.serviceAreaKm} km
                      </p>
                    ) : null}

                    {l.status === WORKSPACE_TRADE_STATUS.INVITED &&
                    l.inviteTokenExpires ? (
                      <p className="text-xs text-muted-foreground">
                        Invite expires{" "}
                        {new Date(l.inviteTokenExpires).toLocaleDateString()}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
