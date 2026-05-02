"use client";
import React, { FC } from "react";
import { Ticket, TicketDetails } from "@/shared/model/model";
import { TicketActions } from "./TicketActions";

// shadcn/ui
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// lucide icons for clean, consistent UI
import {
  Tag,
  Flag,
  Paperclip,
  Image as ImageIcon,
  Video,
  FileText,
  User,
  UserCheck,
} from "lucide-react";
import {
  formatDate,
  hasAnyFiles,
  priorityPillClasses,
  statusPillClasses,
} from "../helpers/helpers";

const TicketCard: FC<{ ticket: Ticket }> = ({ ticket }) => {
  const {
    title,
    description,
    status,
    user,
    area,
    category,
    createdAt,
    priority,
    images,
    videos,
    documents,
    attachments,
    files,
    media,
    actionedBy,
    unitLabel,
    propertyName,
  } = ticket as TicketDetails;

  const imageCount = images?.length ?? 0;
  const videoCount = videos?.length ?? 0;
  const docCount = documents?.length ?? 0;
  const attachCount = attachments?.length ?? 0;
  const filesCount = files?.length ?? 0;
  const mediaCount = media?.length ?? 0;

  const totalAttachments =
    imageCount + videoCount + docCount + attachCount + filesCount + mediaCount;

  return (
    <Card className="w-full transition hover:shadow-md cursor-pointer">
      <CardHeader className="space-y-2">
        <div className="flex items-center flex-wrap  justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <time title={String(createdAt)}>{formatDate(createdAt)}</time>
            {area ? (
              <Badge
                variant="outline"
                title={area}
                className="max-w-[180px] capitalize truncate"
              >
                {area}
              </Badge>
            ) : null}
            {unitLabel ? (
              <Badge
                variant="outline"
                title={unitLabel}
                className="max-w-[180px] truncate"
              >
                {propertyName} - {unitLabel}
              </Badge>
            ) : null}
          </div>

          {/* Status colored pill */}
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide",
              statusPillClasses(status),
            ].join(" ")}
            title={`Status: ${status}`}
          >
            {String(status)}
          </span>
        </div>

        <CardTitle title={title} className="leading-6 line-clamp-2">
          {title}
        </CardTitle>

        {category?.name || priority || hasAnyFiles(ticket) ? (
          <CardDescription className="flex flex-wrap items-center gap-3 text-xs">
            {category?.name ? (
              <span
                className="inline-flex items-center gap-1.5"
                title={`Category: ${category.name}`}
              >
                <Tag className="h-3.5 w-3.5" aria-hidden />
                <span className="truncate max-w-[200px]">{category.name}</span>
              </span>
            ) : null}

            {priority ? (
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
                  priorityPillClasses(priority),
                ].join(" ")}
                title={`Priority: ${priority}`}
              >
                <Flag className="h-3.5 w-3.5" aria-hidden />
                <span className="uppercase text-[10px]">
                  {String(priority)}
                </span>
              </span>
            ) : null}

            {hasAnyFiles(ticket) ? (
              <span
                className="inline-flex items-center gap-1.5"
                title="This ticket has attachments"
              >
                <Paperclip className="h-3.5 w-3.5" aria-hidden />
                {totalAttachments > 0 ? <span>{totalAttachments}</span> : null}
              </span>
            ) : null}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
      </CardContent>

      <Separator className="my-2" />

      <CardFooter className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-2 min-w-0">
          <User className="h-4 w-4" aria-hidden />
          <span className="truncate" title={user?.name}>
            {user?.name}
          </span>
        </span>

        <div className="flex items-center gap-3">
          {/* Specific media type hints (optional, shows only when present) */}
          {imageCount > 0 ? (
            <span title={`${imageCount} image(s) attached`}>
              <ImageIcon
                className="h-4 w-4"
                aria-label={`${imageCount} image(s) attached`}
              />
            </span>
          ) : null}
          {videoCount > 0 ? (
            <span title={`${videoCount} video(s) attached`}>
              <Video
                className="h-4 w-4"
                aria-label={`${videoCount} video(s) attached`}
              />
            </span>
          ) : null}
          {docCount > 0 ? (
            <span title={`${docCount} document(s) attached`}>
              <FileText
                className="h-4 w-4"
                aria-label={`${docCount} document(s) attached`}
              />
            </span>
          ) : null}

          {/* ActionedBy chip */}
          {actionedBy?.name ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5">
              <UserCheck className="h-3.5 w-3.5" aria-hidden />
              <span
                className="truncate max-w-[160px]"
                title={`Actioned by: ${actionedBy.name}`}
              >
                {actionedBy.name}
              </span>
            </span>
          ) : null}

          <section className="flex items-center gap-2">
            <TicketActions ticket={ticket} />
          </section>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TicketCard;
