"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, Send, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ErrorList from "@/components/ui/ErrorList";
import AdminQuoteChatButton from "@/features/conversations/components/AdminQuoteChatButton";
import BroadcastRepairDialog, {
  type BroadcastTicketContext,
} from "@/features/repair-requests/forms/BroadcastRepairDialog";

import {
  REPAIR_QUOTE_STATUS,
  type RepairQuoteStatus,
} from "@/features/repair-quotes/models/repair-quote-status.model";
import {
  REPAIR_REQUEST_STATUS,
  type RepairRequestStatus,
} from "@/features/repair-requests/models/repair-request-status.model";

type Trade = {
  _id: string;
  businessName?: string;
  slug?: string;
  specialties?: string[];
};

type Quote = {
  _id: string;
  repairRequest: string;
  amountCents: number;
  currency: string;
  warrantyDays?: number;
  scheduleProposal?: { earliestStart?: string; durationHours?: number };
  terms?: string;
  status: RepairQuoteStatus;
  submittedAt?: string;
  decidedAt?: string;
  tradesperson?: Trade;
  lineItems?: Array<{ label: string; amountCents: number; quantity: number }>;
};

type RequestSummary = {
  _id: string;
  status: RepairRequestStatus;
  specialty?: string;
  createdAt?: string;
};

type Props = {
  ticketSlug: string;
  /**
   * Compact ticket context passed through to the broadcast dialog so it
   * can render a context card + AI diagnosis toggle without needing its
   * own fetch.
   */
  ticket: BroadcastTicketContext;
};

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

function statusTone(status: RepairQuoteStatus) {
  switch (status) {
    case REPAIR_QUOTE_STATUS.ACCEPTED:
      return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-300";
    case REPAIR_QUOTE_STATUS.DECLINED:
    case REPAIR_QUOTE_STATUS.WITHDRAWN:
    case REPAIR_QUOTE_STATUS.EXPIRED:
    case REPAIR_QUOTE_STATUS.REVISED:
      return "border-border bg-muted text-muted-foreground";
    default:
      return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300";
  }
}

/**
 * Admin-side comparison panel of every quote received against any
 * RepairRequest for the current ticket. Renders on the ticket detail page.
 *
 * Accept fires the atomic transaction (close request + decline siblings +
 * assign ticket); Decline is single-quote. Both refresh the Next.js cache so
 * the rest of the ticket page reflects the new ticket status.
 */
export default function AdminRepairQuotesPanel({ ticketSlug, ticket }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [data, setData] = useState<{
    repairRequests: RequestSummary[];
    quotes: Quote[];
  }>({
    repairRequests: [],
    quotes: [],
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/tickets/${encodeURIComponent(ticketSlug)}/repair-quotes`,
      );
      const body = await res.json();
      if (!res.ok) {
        setError(body);
        return;
      }
      setData(body.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [ticketSlug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function decide(quoteId: string, action: "accept" | "decline") {
    setPendingId(quoteId);
    setError(null);
    try {
      const res = await fetch(`/api/repair-quotes/${quoteId}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        setError(await res.json().catch(() => ({})));
        return;
      }
      await refresh();
      // Accept changes ticket.status — refresh the surrounding server tree too.
      if (action === "accept") router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  const broadcastDialog = (
    <BroadcastRepairDialog
      ticket={ticket}
      open={broadcastOpen}
      onOpenChange={setBroadcastOpen}
      onSuccess={() => {
        refresh();
        router.refresh();
      }}
    />
  );

  if (loading) {
    return (
      <>
        <Card>
          <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading repair requests…
          </CardContent>
        </Card>
        {broadcastDialog}
      </>
    );
  }

  // Empty state: this is now the PRIMARY entry point for broadcasting,
  // promoted out of the row-actions menu into a first-class CTA card.
  if (data.repairRequests.length === 0 && data.quotes.length === 0) {
    return (
      <>
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="size-4 text-primary" />
                Send to tradespeople
              </CardTitle>
              <CardDescription>
                Broadcast this repair to all matching trades in your workspace,
                or hand-pick a shortlist. Trades reply with line-item quotes.
              </CardDescription>
            </div>
            <Button type="button" onClick={() => setBroadcastOpen(true)}>
              <Send className="mr-2 size-4" />
              Send request
            </Button>
          </CardHeader>
        </Card>
        {broadcastDialog}
      </>
    );
  }

  // Group quotes by repair request so the admin can see each broadcast separately.
  const byRequest = new Map<string, Quote[]>();
  for (const q of data.quotes) {
    const list = byRequest.get(q.repairRequest) ?? [];
    list.push(q);
    byRequest.set(q.repairRequest, list);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Repair requests &amp; quotes</CardTitle>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setBroadcastOpen(true)}
        >
          <Send className="mr-1.5 size-3.5" />
          Send another request
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? (
          <ErrorList title="Couldn't update quote" error={error as never} />
        ) : null}

        {data.repairRequests.map((req) => {
          const quotes = byRequest.get(String(req._id)) ?? [];
          return (
            <div key={String(req._id)} className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="uppercase tracking-wide">
                    Broadcast {req.specialty ? `· ${req.specialty}` : ""}
                  </span>
                  <span
                    className={
                      "rounded-full border px-2 py-0.5 text-[10px] uppercase " +
                      (req.status === REPAIR_REQUEST_STATUS.OPEN
                        ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300"
                        : "border-border bg-muted text-muted-foreground")
                    }
                  >
                    {req.status}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {req.createdAt
                    ? new Date(req.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>

              {quotes.length === 0 ? (
                <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  No quotes received yet for this broadcast.
                </p>
              ) : (
                <ul className="space-y-2">
                  {quotes.map((q) => {
                    const isPending = pendingId === q._id;
                    const canDecide =
                      q.status === REPAIR_QUOTE_STATUS.SUBMITTED &&
                      req.status === REPAIR_REQUEST_STATUS.OPEN;
                    return (
                      <li
                        key={q._id}
                        className="rounded-md border border-border bg-background p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">
                              {q.tradesperson?.businessName ?? "Tradesperson"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {q.tradesperson?.slug}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {formatCents(q.amountCents, q.currency)}
                            </span>
                            <span
                              className={
                                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide " +
                                statusTone(q.status)
                              }
                            >
                              {q.status}
                            </span>
                          </div>
                        </div>

                        {q.lineItems?.length ? (
                          <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                            {q.lineItems.map((it, i) => (
                              <li
                                key={i}
                                className="flex justify-between gap-3"
                              >
                                <span>
                                  {it.label}
                                  {it.quantity > 1
                                    ? ` × ${it.quantity}`
                                    : ""}
                                </span>
                                <span>
                                  {formatCents(
                                    (it.amountCents ?? 0) *
                                      (it.quantity ?? 1),
                                    q.currency,
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {q.warrantyDays ? (
                            <span>{q.warrantyDays}-day warranty</span>
                          ) : null}
                          {q.scheduleProposal?.durationHours ? (
                            <span>
                              · ~{q.scheduleProposal.durationHours}h estimate
                            </span>
                          ) : null}
                          {q.scheduleProposal?.earliestStart ? (
                            <span>
                              · earliest{" "}
                              {new Date(
                                q.scheduleProposal.earliestStart,
                              ).toLocaleDateString()}
                            </span>
                          ) : null}
                        </div>

                        {q.terms ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Terms: </span>
                            {q.terms}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap justify-end gap-2">
                          {q.tradesperson?._id ? (
                            <AdminQuoteChatButton
                              repairRequestId={String(q.repairRequest)}
                              tradespersonId={String(q.tradesperson._id)}
                              tradeBusinessName={q.tradesperson?.businessName}
                            />
                          ) : null}
                          {canDecide ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={isPending}
                                onClick={() => decide(q._id, "decline")}
                              >
                                <X className="mr-1 size-3.5" />
                                Decline
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                disabled={isPending}
                                onClick={() => decide(q._id, "accept")}
                              >
                                {isPending ? (
                                  <Loader2 className="mr-1 size-3.5 animate-spin" />
                                ) : (
                                  <Check className="mr-1 size-3.5" />
                                )}
                                Accept
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </CardContent>
      {broadcastDialog}
    </Card>
  );
}
