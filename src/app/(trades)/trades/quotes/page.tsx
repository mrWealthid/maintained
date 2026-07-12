import Link from "next/link";

import { requireTradeAccess } from "@/lib/auth/requireTradeAccess";
import { connect } from "@/dbConfig/dbConfig";
import RepairQuote from "@/models/repairQuoteModel";
import RepairRequest from "@/models/repairRequestModel";
import Ticket from "@/models/ticketModel";
import {
  REPAIR_QUOTE_STATUS,
  type RepairQuoteStatus,
} from "@/features/repair-quotes/models/repair-quote-status.model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WithdrawQuoteButton from "@/features/repair-quotes/components/WithdrawQuoteButton";

export const dynamic = "force-dynamic";

function statusTone(status: RepairQuoteStatus): string {
  switch (status) {
    case REPAIR_QUOTE_STATUS.ACCEPTED:
      return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-300";
    case REPAIR_QUOTE_STATUS.DECLINED:
    case REPAIR_QUOTE_STATUS.WITHDRAWN:
    case REPAIR_QUOTE_STATUS.EXPIRED:
      return "border-border bg-muted text-muted-foreground";
    case REPAIR_QUOTE_STATUS.REVISED:
      return "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/40 dark:bg-blue-950/30 dark:text-blue-300";
    default:
      return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300";
  }
}

function formatCents(amountCents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(amountCents / 100);
  } catch {
    return `${currency} ${(amountCents / 100).toFixed(2)}`;
  }
}

/**
 * Trade-side list of quotes the calling tradesperson has submitted, newest
 * first. The submit / revise CTA lives on /trades/requests; this page is the
 * historical record + the withdraw entry point for still-live quotes.
 */
export default async function TradeQuotesPage() {
  const ctx = await requireTradeAccess({ nextPath: "/trades/quotes" });
  await connect();

  const quotes = await RepairQuote.find({ tradesperson: ctx.tradesperson._id })
    .sort({ submittedAt: -1 })
    .limit(100)
    .lean<
      Array<{
        _id: unknown;
        repairRequest: unknown;
        amountCents: number;
        currency: string;
        status: RepairQuoteStatus;
        warrantyDays?: number;
        terms?: string;
        scheduleProposal?: { earliestStart?: Date; durationHours?: number };
        submittedAt?: Date;
        decidedAt?: Date;
        lineItems?: Array<{ label: string; amountCents: number; quantity: number }>;
      }>
    >();

  const requestIds = Array.from(new Set(quotes.map((q) => String(q.repairRequest))));
  const repairRequests = requestIds.length
    ? await RepairRequest.find({ _id: { $in: requestIds } })
        .select("ticket specialty")
        .lean<Array<{ _id: unknown; ticket: unknown; specialty?: string }>>()
    : [];
  const requestById = new Map(repairRequests.map((r) => [String(r._id), r]));

  const ticketIds = Array.from(
    new Set(repairRequests.map((r) => String(r.ticket))),
  );
  const tickets = ticketIds.length
    ? await Ticket.find({ _id: { $in: ticketIds } })
        .select("title slug")
        .lean<Array<{ _id: unknown; title?: string; slug?: string }>>()
    : [];
  const ticketById = new Map(tickets.map((t) => [String(t._id), t]));

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">
              {ctx.tradesperson.businessName}
            </p>
            <p className="text-xs text-muted-foreground">My quotes</p>
          </div>
          <Link
            href="/trades"
            className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        {quotes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              You haven&apos;t submitted any quotes yet.{" "}
              <Link
                href="/trades/requests"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Browse open requests
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {quotes.map((q) => {
              const req = requestById.get(String(q.repairRequest));
              const ticket = req ? ticketById.get(String(req.ticket)) : undefined;
              const isLive = q.status === REPAIR_QUOTE_STATUS.SUBMITTED;

              return (
                <li key={String(q._id)}>
                  <Card>
                    <CardHeader className="space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base">
                          {ticket?.title ?? "Repair request"}
                        </CardTitle>
                        <span
                          className={
                            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide " +
                            statusTone(q.status)
                          }
                        >
                          {q.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Submitted{" "}
                        {q.submittedAt
                          ? new Date(q.submittedAt).toLocaleString()
                          : "—"}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">
                          {formatCents(q.amountCents, q.currency)}
                        </span>
                        {q.warrantyDays ? (
                          <span className="text-xs text-muted-foreground">
                            {q.warrantyDays}-day warranty
                          </span>
                        ) : null}
                      </div>

                      {q.lineItems?.length ? (
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {q.lineItems.map((it, i) => (
                            <li key={i} className="flex justify-between gap-3">
                              <span>
                                {it.label}
                                {it.quantity > 1 ? ` × ${it.quantity}` : ""}
                              </span>
                              <span>
                                {formatCents(
                                  (it.amountCents ?? 0) * (it.quantity ?? 1),
                                  q.currency,
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {q.terms ? (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Terms: </span>
                          {q.terms}
                        </p>
                      ) : null}

                      {isLive ? (
                        <div className="flex justify-end pt-1">
                          <WithdrawQuoteButton quoteId={String(q._id)} />
                        </div>
                      ) : null}
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
