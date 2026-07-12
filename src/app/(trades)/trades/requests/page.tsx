import Link from "next/link";

import { requireTradeAccess } from "@/lib/auth/requireTradeAccess";
import { connect } from "@/dbConfig/dbConfig";
import RepairRequest from "@/models/repairRequestModel";
import RepairQuote from "@/models/repairQuoteModel";
import Ticket from "@/models/ticketModel";
import WorkspaceTrade from "@/models/workspaceTradeModel";
import { REPAIR_REQUEST_STATUS } from "@/features/repair-requests/models/repair-request-status.model";
import { REPAIR_QUOTE_LIVE_STATUSES } from "@/features/repair-quotes/models/repair-quote-status.model";
import { TECHNICIAN_SPECIALTY_LABELS } from "@/features/technicians/models/technician-specialty.model";
import { WORKSPACE_TRADE_STATUS } from "@/features/trades/models/trade-status.model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RequestCardQuoteAction from "@/features/repair-quotes/components/RequestCardQuoteAction";

export const dynamic = "force-dynamic";

type Tab = "all" | "broadcast" | "invited";

type SearchParamRecord = Record<string, string | string[] | undefined>;

function parseTab(raw: string | string[] | undefined): Tab {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "broadcast" || v === "invited") return v;
  return "all";
}

/**
 * Trade-side inbox of open RepairRequests. Renders the AI diagnosis snapshot
 * inline so the trade has the technician notes the workspace's AI produced
 * before deciding to engage. Quoting + chat ship with Phases 3/4.
 *
 * Server-rendered for SEO-irrelevant pages just to keep the round-trip
 * count down — no client state needed yet beyond tab selection in the URL.
 */
export default async function TradeRequestsInboxPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const ctx = await requireTradeAccess({ nextPath: "/trades/requests" });
  const params = await searchParams;
  const tab = parseTab(params.tab);

  await connect();

  const specialties = ctx.tradesperson.specialties ?? [];
  const tradeId = ctx.tradesperson._id;

  // Only workspaces I'm actively linked to may broadcast to me.
  const activeLinks = await WorkspaceTrade.find({
    tradesperson: tradeId,
    status: WORKSPACE_TRADE_STATUS.ACTIVE,
  })
    .select("workspace")
    .lean<Array<{ workspace: unknown }>>();
  const linkedWorkspaceIds = activeLinks.map((l) => String(l.workspace));

  let filter: Record<string, unknown> = {
    status: REPAIR_REQUEST_STATUS.OPEN,
  };
  if (tab === "invited") {
    filter = { ...filter, invitedTradespeople: tradeId };
  } else if (tab === "broadcast") {
    filter = {
      ...filter,
      invitedTradespeople: { $size: 0 },
      specialty: { $in: specialties.length ? specialties : ["__none__"] },
      workspace: { $in: linkedWorkspaceIds.length ? linkedWorkspaceIds : ["__none__"] },
    };
  } else {
    filter.$or = [
      { invitedTradespeople: tradeId },
      {
        invitedTradespeople: { $size: 0 },
        specialty: { $in: specialties.length ? specialties : ["__none__"] },
        workspace: { $in: linkedWorkspaceIds.length ? linkedWorkspaceIds : ["__none__"] },
      },
    ];
  }

  const repairRequests = await RepairRequest.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean<
      Array<{
        _id: unknown;
        ticket: unknown;
        specialty?: string;
        scopeNotes?: string;
        technicianDiagnosis?: {
          probableIssue?: string;
          inspectionPoints?: string[];
          recommendedTools?: string[];
          safetyNotes?: string[];
        };
        invitedTradespeople: unknown[];
        createdAt?: Date;
        expiresAt?: Date;
      }>
    >();

  const ticketIds = Array.from(
    new Set(repairRequests.map((r) => String(r.ticket))),
  );
  const tickets = ticketIds.length
    ? await Ticket.find({ _id: { $in: ticketIds } })
        .select("title slug priority area propertyName unitLabel createdAt")
        .lean<
          Array<{
            _id: unknown;
            title?: string;
            slug?: string;
            priority?: string;
            area?: string;
            propertyName?: string;
            unitLabel?: string;
            createdAt?: Date;
          }>
        >()
    : [];
  const ticketsById = new Map(tickets.map((t) => [String(t._id), t]));

  // Which requests this trade has already quoted on (and the quote is still
  // live). Drives the "Submit quote" vs "Revise quote" CTA on each card.
  const requestIds = repairRequests.map((r) => r._id);
  const liveQuotes = requestIds.length
    ? await RepairQuote.find({
        tradesperson: tradeId,
        repairRequest: { $in: requestIds },
        status: { $in: REPAIR_QUOTE_LIVE_STATUSES },
      })
        .select("repairRequest")
        .lean<Array<{ repairRequest: unknown }>>()
    : [];
  const liveQuoteRequestIds = new Set(
    liveQuotes.map((q) => String(q.repairRequest)),
  );

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">
              {ctx.tradesperson.businessName}
            </p>
            <p className="text-xs text-muted-foreground">Repair request inbox</p>
          </div>
          <Link
            href="/trades"
            className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <nav className="flex items-center gap-1 border-b border-border">
          {(["all", "broadcast", "invited"] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <Link
                key={t}
                href={t === "all" ? "/trades/requests" : `/trades/requests?tab=${t}`}
                className={
                  "px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "border-b-2 border-foreground font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {t === "all" ? "All" : t === "broadcast" ? "Broadcast" : "Invited"}
              </Link>
            );
          })}
        </nav>

        {repairRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {tab === "invited"
                ? "No workspace has invited you to a specific request yet."
                : tab === "broadcast"
                  ? "No open broadcasts match your specialties right now."
                  : "No open requests for you yet. Make sure your specialties are set on your profile."}
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {repairRequests.map((r) => {
              const t = ticketsById.get(String(r.ticket));
              const diag = r.technicianDiagnosis;
              const isShortlist = (r.invitedTradespeople?.length ?? 0) > 0;
              return (
                <li key={String(r._id)}>
                  <Card>
                    <CardHeader className="space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base">
                          {t?.title ?? "Repair request"}
                        </CardTitle>
                        <span
                          className={
                            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide " +
                            (isShortlist
                              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/40 dark:bg-blue-950/30 dark:text-blue-300"
                              : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-300")
                          }
                        >
                          {isShortlist ? "Invited" : "Broadcast"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {r.specialty ? (
                          <span>
                            {TECHNICIAN_SPECIALTY_LABELS[
                              r.specialty as keyof typeof TECHNICIAN_SPECIALTY_LABELS
                            ] ?? r.specialty}
                          </span>
                        ) : null}
                        {t?.propertyName ? <span>· {t.propertyName}</span> : null}
                        {t?.unitLabel ? <span>· {t.unitLabel}</span> : null}
                        {t?.priority ? <span>· {t.priority}</span> : null}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 text-sm">
                      {r.scopeNotes ? (
                        <div className="rounded-md border border-border bg-muted/30 p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Workspace notes
                          </p>
                          <p className="mt-1 whitespace-pre-wrap">{r.scopeNotes}</p>
                        </div>
                      ) : null}

                      {diag ? (
                        <div className="rounded-md border border-amber-200 bg-amber-50/40 p-3 dark:border-amber-700/30 dark:bg-amber-950/20">
                          <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                            AI technician diagnosis
                          </p>
                          {diag.probableIssue ? (
                            <p className="mt-1">{diag.probableIssue}</p>
                          ) : null}
                          {diag.inspectionPoints?.length ? (
                            <>
                              <p className="mt-2 text-xs font-medium text-muted-foreground">
                                Inspect
                              </p>
                              <ul className="ml-4 list-disc text-xs">
                                {diag.inspectionPoints.map((p, i) => (
                                  <li key={i}>{p}</li>
                                ))}
                              </ul>
                            </>
                          ) : null}
                          {diag.recommendedTools?.length ? (
                            <>
                              <p className="mt-2 text-xs font-medium text-muted-foreground">
                                Tools
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {diag.recommendedTools.map((tool, i) => (
                                  <span
                                    key={i}
                                    className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px]"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </>
                          ) : null}
                          {diag.safetyNotes?.length ? (
                            <>
                              <p className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300">
                                Safety
                              </p>
                              <ul className="ml-4 list-disc text-xs">
                                {diag.safetyNotes.map((p, i) => (
                                  <li key={i}>{p}</li>
                                ))}
                              </ul>
                            </>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>
                          Issued{" "}
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                        <RequestCardQuoteAction
                          repairRequestId={String(r._id)}
                          ticketTitle={t?.title}
                          hasLiveQuote={liveQuoteRequestIds.has(String(r._id))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
