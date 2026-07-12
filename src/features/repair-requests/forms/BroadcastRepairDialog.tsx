"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  HardHat,
  Loader2,
  MapPin,
  Radio,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorList from "@/components/ui/ErrorList";

import {
  TECHNICIAN_SPECIALTY_LABELS,
  TECHNICIAN_SPECIALTY_VALUES,
} from "@/features/technicians/models/technician-specialty.model";
import { WORKSPACE_TRADE_STATUS } from "@/features/trades/models/trade-status.model";

/** Slice of the ticket the dialog uses for context — kept small on purpose. */
export type BroadcastTicketContext = {
  slug: string;
  title?: string;
  area?: string;
  priority?: string;
  propertyName?: string;
  unitLabel?: string;
  diagnosis?: {
    probableIssue?: string;
    inspectionPoints?: string[];
    recommendedTools?: string[];
    safetyNotes?: string[];
  };
};

type WorkspaceTradeRow = {
  _id: string;
  status: string;
  invitedEmail?: string;
  tradesperson?: {
    _id: string;
    businessName?: string;
    slug?: string;
    contactEmail?: string;
    contactPhone?: string;
    specialties?: string[];
    verificationStatus?: string;
    isActive?: boolean;
    serviceAreaKm?: number;
  };
};

type Props = {
  ticket: BroadcastTicketContext;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

type Mode = "broadcast" | "shortlist";

function priorityTone(priority?: string) {
  switch ((priority ?? "").toLowerCase()) {
    case "urgent":
    case "high":
      return "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/40 dark:bg-rose-950/30 dark:text-rose-300";
    case "medium":
      return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function specialtyLabel(s: string) {
  return (
    TECHNICIAN_SPECIALTY_LABELS[s as keyof typeof TECHNICIAN_SPECIALTY_LABELS] ??
    s
  );
}

/**
 * Rich broadcast/invite dialog. Replaces the previous bare-bones modal:
 *
 *   - Ticket context card pinned at the top so the admin sees what
 *     they're sending out without leaving the dialog.
 *   - Mode tabs: open broadcast (specialty → all matching active trades)
 *     vs. shortlist (explicit multi-select).
 *   - Live recipient count — fetched from /api/workspaces/me/trades on
 *     open, filtered client-side so the admin sees the exact audience.
 *   - Per-broadcast control: scope notes, optional AI-diagnosis attach
 *     (with collapsible preview of the exact text trades will see),
 *     optional expiry.
 *
 * Submits to POST /api/tickets/[slug]/broadcast. On success refreshes
 * the parent via `onSuccess`.
 */
export default function BroadcastRepairDialog({
  ticket,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const hasDiagnosis = useMemo(
    () =>
      Boolean(
        ticket.diagnosis &&
          (ticket.diagnosis.probableIssue?.trim() ||
            (ticket.diagnosis.inspectionPoints?.length ?? 0) > 0 ||
            (ticket.diagnosis.recommendedTools?.length ?? 0) > 0 ||
            (ticket.diagnosis.safetyNotes?.length ?? 0) > 0),
      ),
    [ticket.diagnosis],
  );

  const [mode, setMode] = useState<Mode>("broadcast");
  const [specialty, setSpecialty] = useState<string>("");
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [shortlistFilter, setShortlistFilter] = useState<string>("");
  const [scopeNotes, setScopeNotes] = useState("");
  const [includeDiagnosis, setIncludeDiagnosis] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [showDiagnosisPreview, setShowDiagnosisPreview] = useState(false);

  const [trades, setTrades] = useState<WorkspaceTradeRow[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Reset state every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setMode("broadcast");
    setSpecialty("");
    setSelectedSlugs(new Set());
    setSearch("");
    setShortlistFilter("");
    setScopeNotes("");
    setIncludeDiagnosis(true);
    setExpiresAt("");
    setShowDiagnosisPreview(false);
    setError(null);
  }, [open]);

  // Fetch the workspace's linked trades once the dialog opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoadingTrades(true);
      try {
        const res = await fetch("/api/workspaces/me/trades");
        const body = await res.json();
        if (cancelled || !res.ok) return;
        setTrades((body.data ?? []) as WorkspaceTradeRow[]);
      } finally {
        if (!cancelled) setLoadingTrades(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Active trades only — invited/suspended are filtered out (they can't
  // receive broadcasts until they accept).
  const activeTrades = useMemo(
    () =>
      trades.filter(
        (t) =>
          t.status === WORKSPACE_TRADE_STATUS.ACTIVE &&
          t.tradesperson?.isActive,
      ),
    [trades],
  );

  // Live recipient resolution for the broadcast tab.
  const broadcastRecipients = useMemo(() => {
    if (!specialty) return [] as WorkspaceTradeRow[];
    return activeTrades.filter((t) =>
      (t.tradesperson?.specialties ?? []).includes(specialty),
    );
  }, [activeTrades, specialty]);

  // Filtered list for the shortlist tab.
  const shortlistVisible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeTrades.filter((t) => {
      const tp = t.tradesperson;
      if (!tp) return false;
      if (shortlistFilter && !(tp.specialties ?? []).includes(shortlistFilter))
        return false;
      if (!q) return true;
      return (
        (tp.businessName ?? "").toLowerCase().includes(q) ||
        (tp.contactEmail ?? "").toLowerCase().includes(q) ||
        (tp.slug ?? "").toLowerCase().includes(q)
      );
    });
  }, [activeTrades, search, shortlistFilter]);

  const selectedShortlistSlugs = useMemo(
    () => Array.from(selectedSlugs),
    [selectedSlugs],
  );

  const recipientCount =
    mode === "broadcast" ? broadcastRecipients.length : selectedShortlistSlugs.length;

  const canSubmit =
    !submitting &&
    (mode === "broadcast"
      ? Boolean(specialty) && broadcastRecipients.length > 0
      : selectedShortlistSlugs.length > 0);

  function toggleSelected(slug: string) {
    setSelectedSlugs((cur) => {
      const next = new Set(cur);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.slug)}/broadcast`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            specialty: mode === "broadcast" ? specialty : undefined,
            invitedTradespeopleSlugs:
              mode === "shortlist" ? selectedShortlistSlugs : [],
            scopeNotes: scopeNotes.trim() || undefined,
            includeDiagnosis: hasDiagnosis ? includeDiagnosis : undefined,
            expiresAt: expiresAt
              ? new Date(expiresAt).toISOString()
              : undefined,
          }),
        },
      );
      if (!res.ok) {
        setError(await res.json().catch(() => ({})));
        return;
      }
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  }

  const noLinkedTrades = !loadingTrades && activeTrades.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppDialogContent className="sm:max-w-3xl">
        <AppDialogHeader
          icon={Send}
          title="Send repair request"
          description="Broadcast to all matching trades or hand-pick from the ones you've linked. Trades only see what you include here."
        />
        <AppDialogBody className="space-y-5">
          {/* Ticket context */}
          <section className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {ticket.title ?? "Repair"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {ticket.area ? (
                    <span className="inline-flex items-center gap-1">
                      <ClipboardList className="size-3" />
                      {ticket.area}
                    </span>
                  ) : null}
                  {ticket.propertyName ? (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="size-3" />
                      {ticket.propertyName}
                      {ticket.unitLabel ? ` · ${ticket.unitLabel}` : ""}
                    </span>
                  ) : null}
                </div>
              </div>
              {ticket.priority ? (
                <span
                  className={
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide " +
                    priorityTone(ticket.priority)
                  }
                >
                  {ticket.priority}
                </span>
              ) : null}
            </div>
            {hasDiagnosis && ticket.diagnosis?.probableIssue ? (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                <Bot className="mr-1 inline size-3 text-amber-600" />
                <span className="font-medium text-foreground">
                  AI diagnosis:
                </span>{" "}
                {ticket.diagnosis.probableIssue}
              </p>
            ) : null}
          </section>

          {error ? (
            <ErrorList title="Couldn't send request" error={error as never} />
          ) : null}

          {noLinkedTrades ? (
            <div className="rounded-md border border-amber-300 bg-amber-50/60 p-3 text-sm dark:border-amber-700/40 dark:bg-amber-950/30">
              <p className="font-medium text-amber-900 dark:text-amber-200">
                No active tradespeople linked yet.
              </p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                Invite trades on{" "}
                <a
                  href="/dashboard/trades"
                  className="underline underline-offset-2"
                >
                  /dashboard/trades
                </a>{" "}
                so they can receive your repair requests.
              </p>
            </div>
          ) : null}

          {/* Mode tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="broadcast" className="gap-2">
                <Radio className="size-3.5" />
                Broadcast
              </TabsTrigger>
              <TabsTrigger value="shortlist" className="gap-2">
                <Users className="size-3.5" />
                Pick specific
              </TabsTrigger>
            </TabsList>

            {/* Broadcast tab */}
            <TabsContent value="broadcast" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="specialty">Specialty</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Pick the trade you need" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHNICIAN_SPECIALTY_VALUES.map((s) => {
                      const count = activeTrades.filter((t) =>
                        (t.tradesperson?.specialties ?? []).includes(s),
                      ).length;
                      return (
                        <SelectItem key={s} value={s}>
                          <span className="flex items-center justify-between gap-3">
                            <span>{specialtyLabel(s)}</span>
                            <span className="text-xs text-muted-foreground">
                              {count} {count === 1 ? "trade" : "trades"}
                            </span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {specialty ? (
                <div className="rounded-md border border-border bg-card p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Reaching {broadcastRecipients.length}{" "}
                    {broadcastRecipients.length === 1 ? "tradesperson" : "tradespeople"}
                  </p>
                  {broadcastRecipients.length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      No active trades in this specialty yet.{" "}
                      <a
                        href="/dashboard/trades"
                        className="underline underline-offset-2"
                      >
                        Invite some
                      </a>
                      .
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-xs">
                      {broadcastRecipients.slice(0, 6).map((t) => (
                        <li
                          key={t._id}
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="truncate">
                            {t.tradesperson?.businessName}
                          </span>
                          {t.tradesperson?.verificationStatus === "verified" ? (
                            <ShieldCheck className="size-3 text-emerald-600" />
                          ) : null}
                        </li>
                      ))}
                      {broadcastRecipients.length > 6 ? (
                        <li className="text-muted-foreground">
                          + {broadcastRecipients.length - 6} more
                        </li>
                      ) : null}
                    </ul>
                  )}
                </div>
              ) : null}
            </TabsContent>

            {/* Shortlist tab */}
            <TabsContent value="shortlist" className="space-y-3 pt-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, slug"
                    className="pl-7"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={shortlistFilter || "all"}
                  onValueChange={(v) =>
                    setShortlistFilter(v === "all" ? "" : v)
                  }
                >
                  <SelectTrigger className="sm:w-48">
                    <SelectValue placeholder="Filter specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specialties</SelectItem>
                    {TECHNICIAN_SPECIALTY_VALUES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {specialtyLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-md border border-border bg-card p-1">
                {loadingTrades ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    <Loader2 className="mr-1 inline size-3 animate-spin" />
                    Loading trades…
                  </p>
                ) : shortlistVisible.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    {activeTrades.length === 0
                      ? "No linked trades yet."
                      : "No trades match your filters."}
                  </p>
                ) : (
                  shortlistVisible.map((t) => {
                    const tp = t.tradesperson;
                    if (!tp?.slug) return null;
                    const checked = selectedSlugs.has(tp.slug);
                    return (
                      <label
                        key={t._id}
                        className={
                          "flex cursor-pointer items-start gap-3 rounded-md border p-2 text-sm transition-colors " +
                          (checked
                            ? "border-primary bg-primary/5"
                            : "border-transparent hover:border-border hover:bg-muted/50")
                        }
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleSelected(tp.slug as string)}
                          className="mt-0.5"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate font-medium">
                              {tp.businessName ?? "Tradesperson"}
                            </span>
                            {tp.verificationStatus === "verified" ? (
                              <ShieldCheck className="size-3 text-emerald-600" />
                            ) : null}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {tp.contactEmail}
                            {tp.serviceAreaKm
                              ? ` · ${tp.serviceAreaKm}km radius`
                              : ""}
                          </span>
                          {tp.specialties?.length ? (
                            <span className="mt-1 flex flex-wrap gap-1">
                              {tp.specialties.map((s) => (
                                <span
                                  key={s}
                                  className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px]"
                                >
                                  {specialtyLabel(s)}
                                </span>
                              ))}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              {selectedShortlistSlugs.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Selected{" "}
                  <span className="font-medium text-foreground">
                    {selectedShortlistSlugs.length}
                  </span>{" "}
                  of {activeTrades.length} active trades.
                </p>
              ) : null}
            </TabsContent>
          </Tabs>

          {/* Shared brief */}
          <div className="space-y-1.5">
            <Label htmlFor="scope">Scope notes (optional)</Label>
            <Textarea
              id="scope"
              rows={3}
              placeholder="Anything trades need to know beyond the ticket body — access, parts to bring, schedule constraints."
              value={scopeNotes}
              onChange={(e) => setScopeNotes(e.target.value)}
            />
          </div>

          {/* AI diagnosis attach */}
          {hasDiagnosis ? (
            <div className="rounded-md border border-border bg-muted/30">
              <label className="flex cursor-pointer items-start gap-3 p-3">
                <Switch
                  checked={includeDiagnosis}
                  onCheckedChange={setIncludeDiagnosis}
                />
                <span className="space-y-1 text-sm">
                  <span className="block font-medium">
                    Attach AI technician diagnosis
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Trades see probable issue, inspection points, tools and
                    safety notes inside their inbox + the broadcast email.
                  </span>
                </span>
              </label>
              {includeDiagnosis ? (
                <div className="border-t border-border px-3 pb-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setShowDiagnosisPreview((s) => !s)
                    }
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showDiagnosisPreview ? (
                      <ChevronUp className="size-3" />
                    ) : (
                      <ChevronDown className="size-3" />
                    )}
                    {showDiagnosisPreview ? "Hide preview" : "Preview what trades will see"}
                  </button>
                  {showDiagnosisPreview ? (
                    <DiagnosisPreview diagnosis={ticket.diagnosis!} />
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
              <Bot className="mr-1 inline size-3" />
              No AI diagnosis on this ticket yet — only your scope notes will
              be shared.
            </div>
          )}

          {/* Optional expiry */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Stop accepting quotes (optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Defaults to no expiry. Submitted quotes auto-flip to{" "}
                <code>expired</code> after this time.
              </p>
            </div>
            <div className="hidden sm:block" />
          </div>
        </AppDialogBody>

        <AppDialogFooter className="flex-row items-center justify-between gap-3 sm:flex-row">
          <div className="text-xs text-muted-foreground">
            {mode === "broadcast" ? (
              <span className="inline-flex items-center gap-1">
                <Radio className="size-3" />
                Open broadcast
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Shield className="size-3" />
                Shortlist · only selected trades will see this
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className="min-w-32"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending…
                </>
              ) : recipientCount > 0 ? (
                <>
                  <Send className="mr-2 size-4" />
                  Send to {recipientCount}{" "}
                  {recipientCount === 1 ? "trade" : "trades"}
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </AppDialogFooter>
      </AppDialogContent>
    </Dialog>
  );
}

function DiagnosisPreview({
  diagnosis,
}: {
  diagnosis: NonNullable<BroadcastTicketContext["diagnosis"]>;
}) {
  return (
    <div className="mt-2 space-y-2 rounded-md border border-amber-200 bg-amber-50/50 p-3 text-xs dark:border-amber-700/30 dark:bg-amber-950/20">
      {diagnosis.probableIssue ? (
        <p>
          <span className="font-medium">Probable issue:</span>{" "}
          {diagnosis.probableIssue}
        </p>
      ) : null}
      {diagnosis.inspectionPoints?.length ? (
        <div>
          <p className="font-medium">Inspect</p>
          <ul className="ml-4 list-disc">
            {diagnosis.inspectionPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {diagnosis.recommendedTools?.length ? (
        <div>
          <p className="font-medium">Tools</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {diagnosis.recommendedTools.map((t, i) => (
              <span
                key={i}
                className="rounded-full border border-border bg-background px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {diagnosis.safetyNotes?.length ? (
        <div>
          <p className="font-medium text-rose-700 dark:text-rose-300">Safety</p>
          <ul className="ml-4 list-disc">
            {diagnosis.safetyNotes.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// Silence unused-icon lint for icons referenced only in the preview.
void HardHat;
void MapPin;
void Check;
