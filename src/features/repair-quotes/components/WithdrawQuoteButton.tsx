"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  quoteId: string;
};

/**
 * Tiny client island that POSTs the withdraw endpoint and refreshes the
 * server-rendered list. Confirmation is inline (single extra click) rather
 * than a modal — withdrawing a quote is reversible by re-submitting.
 */
export default function WithdrawQuoteButton({ quoteId }: Props) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, setPending] = useState(false);

  async function onWithdraw() {
    setPending(true);
    try {
      await fetch(`/api/trades/me/quotes/${quoteId}/withdraw`, {
        method: "POST",
      });
      router.refresh();
    } finally {
      setPending(false);
      setArmed(false);
    }
  }

  if (!armed) {
    return (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setArmed(true)}
      >
        Withdraw
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setArmed(false)}
        disabled={pending}
      >
        Cancel
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={onWithdraw}
        disabled={pending}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : "Confirm withdraw"}
      </Button>
    </div>
  );
}
