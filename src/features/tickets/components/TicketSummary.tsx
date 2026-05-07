"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import {
  ClipboardList,
  Image as ImageIcon,
  MapPin,
  Paperclip,
  Tag,
  Video,
  Wrench,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Category, TicketType } from "@/shared/model/model";
import { useFetchTicketType } from "../hooks/ticketHooks";
import { type TicketCreateFormValues } from "../models/ticket-form.model";

interface TicketSummaryProps {
  initialAttachmentCounts?: {
    images: number;
    videos: number;
    documents: number;
  };
}

const TicketSummary: React.FC<TicketSummaryProps> = ({
  initialAttachmentCounts = { images: 0, videos: 0, documents: 0 },
}) => {
  const { watch } = useFormContext<TicketCreateFormValues>();
  const watched = watch();
  const { data: ticketTypes } = useFetchTicketType<TicketType>();

  const selectedTypeName = ticketTypes?.find(
    (t) => t.id === watched.type
  )?.name;
  const categoryName =
    typeof watched.category === "object"
      ? (watched.category as Category)?.name
      : undefined;

  const completedFields = [
    !!watched.title,
    !!watched.description,
    !!watched.category,
    !!watched.area,
    !!watched.type,
  ].filter(Boolean).length;
  const completeness = Math.round((completedFields / 5) * 100);

  return (
    <Card className="overflow-hidden rounded-2xl py-0 shadow-sm lg:sticky lg:top-6">
      <div className="flex items-center gap-3 bg-primary px-5 py-4 text-primary-foreground">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
            Live Preview
          </p>
          <h3 className="text-base font-semibold leading-tight">
            Ticket Summary
          </h3>
        </div>
      </div>

      <CardContent className="space-y-4 px-5 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ticket Title
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-medium",
              watched.title
                ? "text-foreground"
                : "italic text-muted-foreground/70"
            )}
          >
            {watched.title || "Untitled ticket"}
          </p>
        </div>

        <Separator />

        <SummaryRow
          label="Category"
          value={categoryName}
          placeholder="No category set"
          icon={<Tag className="h-4 w-4" />}
        />

        <Separator />

        <SummaryRow
          label="Area"
          value={watched.area}
          placeholder="No area set"
          icon={<MapPin className="h-4 w-4" />}
        />

        <Separator />

        <SummaryRow
          label="Request Type"
          value={selectedTypeName}
          placeholder="No request type set"
          icon={<Wrench className="h-4 w-4" />}
        />

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Attachments
          </p>
          <div className="grid grid-cols-3 gap-2">
            <AttachmentTile
              icon={<ImageIcon className="h-4 w-4" />}
              count={
                (watched.images?.length || 0) + initialAttachmentCounts.images
              }
              label="Images"
            />
            <AttachmentTile
              icon={<Video className="h-4 w-4" />}
              count={
                (watched.videos?.length || 0) + initialAttachmentCounts.videos
              }
              label="Videos"
            />
            <AttachmentTile
              icon={<Paperclip className="h-4 w-4" />}
              count={
                (watched.documents?.length || 0) +
                initialAttachmentCounts.documents
              }
              label="Docs"
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Form completeness</span>
            <span className="font-semibold text-foreground">
              {completeness}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.max(completeness, 2)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function SummaryRow({
  label,
  value,
  icon,
  placeholder,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 truncate text-sm",
            value
              ? "font-medium text-foreground"
              : "italic text-muted-foreground/70"
          )}
        >
          {value || placeholder || "—"}
        </p>
      </div>
    </div>
  );
}

function AttachmentTile({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border bg-muted/30 px-2 py-3">
      <div className="text-muted-foreground">{icon}</div>
      <p className="text-lg font-bold leading-none text-foreground">{count}</p>
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export default TicketSummary;
