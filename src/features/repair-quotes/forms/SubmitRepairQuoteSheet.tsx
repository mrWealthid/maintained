"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import ErrorList from "@/components/ui/ErrorList";

type LineItem = { label: string; amount: string; quantity: string };

type Props = {
  repairRequestId: string;
  /** Short heading for context in the dialog header. */
  ticketTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const BLANK_LINE: LineItem = { label: "", amount: "", quantity: "1" };

/**
 * Trade-side modal for submitting a quote against a `RepairRequest`. Keeps
 * the line-item editing inline (label / amount / quantity) since most
 * repair quotes have under five items. The server (`pre-save` hook) is the
 * source of truth for the total; what we display here is just preview.
 */
export default function SubmitRepairQuoteSheet({
  repairRequestId,
  ticketTitle,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState<LineItem[]>([{ ...BLANK_LINE }]);
  const [warranty, setWarranty] = useState("");
  const [terms, setTerms] = useState("");
  const [earliestStart, setEarliestStart] = useState("");
  const [duration, setDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const previewTotal = items.reduce((sum, it) => {
    const amt = Number(it.amount);
    const qty = Number(it.quantity) || 1;
    if (!Number.isFinite(amt) || amt < 0) return sum;
    return sum + amt * qty;
  }, 0);

  const updateItem = (i: number, patch: Partial<LineItem>) =>
    setItems((s) => s.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const removeItem = (i: number) =>
    setItems((s) => (s.length === 1 ? s : s.filter((_, idx) => idx !== i)));

  async function onSubmit() {
    setError(null);
    const lineItems = items
      .filter((it) => it.label.trim() && Number(it.amount) >= 0)
      .map((it) => ({
        label: it.label.trim(),
        amountCents: Math.round(Number(it.amount) * 100),
        quantity: Math.max(1, Number(it.quantity) || 1),
      }));

    if (lineItems.length === 0) {
      setError({ message: "Add at least one line item with label and amount." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/trades/me/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repairRequestId,
          currency,
          lineItems,
          terms: terms || undefined,
          warrantyDays: warranty ? Number(warranty) : undefined,
          scheduleProposal:
            earliestStart || duration
              ? {
                  earliestStart: earliestStart
                    ? new Date(earliestStart).toISOString()
                    : undefined,
                  durationHours: duration ? Number(duration) : undefined,
                }
              : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body);
        return;
      }
      setItems([{ ...BLANK_LINE }]);
      setWarranty("");
      setTerms("");
      setEarliestStart("");
      setDuration("");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppDialogContent>
        <AppDialogHeader
          title="Submit a quote"
          description={
            ticketTitle
              ? `Your quote for "${ticketTitle}". The workspace will see the line items and total.`
              : "The workspace will see the line items and total."
          }
        />
        <AppDialogBody className="space-y-4">
          {error ? (
            <ErrorList title="Couldn't submit quote" error={error as never} />
          ) : null}

          <div className="space-y-2">
            <div className="flex items-end justify-between gap-2">
              <Label>Line items</Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setItems((s) => [...s, { ...BLANK_LINE }])}
              >
                <Plus className="mr-1 size-3.5" />
                Add line
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <Input
                    className="col-span-6"
                    placeholder="Labor, replace breaker, etc."
                    value={it.label}
                    onChange={(e) => updateItem(i, { label: e.target.value })}
                  />
                  <Input
                    className="col-span-3"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    placeholder="Amount"
                    value={it.amount}
                    onChange={(e) => updateItem(i, { amount: e.target.value })}
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step="1"
                    value={it.quantity}
                    onChange={(e) => updateItem(i, { quantity: e.target.value })}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="col-span-1"
                    disabled={items.length === 1}
                    onClick={() => removeItem(i)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-right text-sm">
              Subtotal:{" "}
              <span className="font-semibold">
                {currency}{" "}
                {previewTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="warranty">Warranty (days)</Label>
              <Input
                id="warranty"
                type="number"
                inputMode="numeric"
                min={0}
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="earliest">Earliest start</Label>
              <Input
                id="earliest"
                type="datetime-local"
                value={earliestStart}
                onChange={(e) => setEarliestStart(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Estimated hours</Label>
              <Input
                id="duration"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="terms">Terms (optional)</Label>
            <Textarea
              id="terms"
              rows={3}
              placeholder="Payment terms, exclusions, parts ownership, etc."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>
        </AppDialogBody>
        <AppDialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit quote"
            )}
          </Button>
        </AppDialogFooter>
      </AppDialogContent>
    </Dialog>
  );
}
