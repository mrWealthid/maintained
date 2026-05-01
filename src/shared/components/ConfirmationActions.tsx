"use client";

import { useState } from "react";
import { Calendar, Download, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ConfirmationActionsProps {
  title: string;
  startsAt?: string;
  location?: string;
  recipientEmail?: string;
  confirmationId?: string;
  description?: string;
  canDownload?: boolean;
  onDownload?: () => Promise<Blob>;
  onResendEmail?: () => Promise<void>;
}

function formatIcsDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getSafeFilename(value: string) {
  return value.trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
}

export function ConfirmationActions({
  title,
  startsAt,
  location,
  recipientEmail,
  confirmationId,
  description,
  canDownload = false,
  onDownload,
  onResendEmail,
}: ConfirmationActionsProps) {
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  async function handleAddToCalendar() {
    if (!startsAt) {
      toast.error("Calendar details are not available yet.");
      return;
    }

    try {
      setIsLoadingCalendar(true);
      const start = new Date(startsAt);
      const content = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Maintain//Confirmation//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${confirmationId ?? crypto.randomUUID()}@maintain.local
DTSTAMP:${formatIcsDate(new Date())}
DTSTART:${formatIcsDate(start)}
SUMMARY:${title}
DESCRIPTION:${description ?? confirmationId ?? ""}
LOCATION:${location ?? ""}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

      downloadBlob(
        new Blob([content], { type: "text/calendar" }),
        `${getSafeFilename(title || "confirmation")}.ics`,
      );
      toast.success("Calendar file downloaded.");
    } catch (error) {
      toast.error("Failed to generate calendar file.");
      console.error("Calendar export error:", error);
    } finally {
      setIsLoadingCalendar(false);
    }
  }

  async function handleDownload() {
    if (!onDownload) return;

    try {
      setIsLoadingDownload(true);
      const blob = await onDownload();
      downloadBlob(blob, `${getSafeFilename(title || "confirmation")}.pdf`);
      toast.success("Download ready.");
    } catch (error) {
      toast.error("Failed to download confirmation.");
      console.error("Confirmation download error:", error);
    } finally {
      setIsLoadingDownload(false);
    }
  }

  async function handleResendEmail() {
    if (!onResendEmail) return;

    try {
      setIsLoadingEmail(true);
      await onResendEmail();
      toast.success(
        recipientEmail
          ? `Confirmation email sent to ${recipientEmail}`
          : "Confirmation email sent.",
      );
    } catch (error) {
      toast.error("Failed to resend confirmation email.");
      console.error("Confirmation email error:", error);
    } finally {
      setIsLoadingEmail(false);
    }
  }

  return (
    <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
      <Button
        type="button"
        variant="outline"
        className="gap-2 bg-transparent"
        onClick={handleAddToCalendar}
        disabled={isLoadingCalendar || !startsAt}
      >
        <Calendar className="size-4" />
        {isLoadingCalendar ? "Generating..." : "Add to Calendar"}
      </Button>

      {canDownload && onDownload ? (
        <Button
          type="button"
          variant="outline"
          className="gap-2 bg-transparent"
          onClick={handleDownload}
          disabled={isLoadingDownload}
        >
          <Download className="size-4" />
          {isLoadingDownload ? "Downloading..." : "Download"}
        </Button>
      ) : null}

      {onResendEmail ? (
        <Button
          type="button"
          variant="outline"
          className="gap-2 bg-transparent"
          onClick={handleResendEmail}
          disabled={isLoadingEmail}
        >
          <Mail className="size-4" />
          {isLoadingEmail ? "Sending..." : "Resend Email"}
        </Button>
      ) : null}
    </div>
  );
}
