"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import SubmitRepairQuoteSheet from "../forms/SubmitRepairQuoteSheet";

type Props = {
  repairRequestId: string;
  ticketTitle?: string;
  /**
   * If the calling trade has already submitted a *live* quote on this
   * request, we hint at revision rather than first submission. The trade
   * can still resubmit — the server flips the prior one to `revised`.
   */
  hasLiveQuote: boolean;
};

/**
 * Tiny client island rendered inside the server-rendered request card.
 * Owns the sheet open/close state so the rest of the inbox stays static
 * HTML.
 */
export default function RequestCardQuoteAction({
  repairRequestId,
  ticketTitle,
  hasLiveQuote,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={hasLiveQuote ? "outline" : "default"}
        onClick={() => setOpen(true)}
      >
        {hasLiveQuote ? "Revise quote" : "Submit quote"}
      </Button>
      <SubmitRepairQuoteSheet
        repairRequestId={repairRequestId}
        ticketTitle={ticketTitle}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
