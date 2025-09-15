"use client";
import React, { FC } from "react";
import { CiUser } from "react-icons/ci";
import { Ticket } from "@/app/shared/model/model";
import Modal from "@/app/shared/components/modal/Modal";
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
  UserCheck,
} from "lucide-react";

// Optional: tiny utility for date formatting
function formatDate(d: string | number | Date) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "";
  }
}

/** Colored pill classes for status */
function statusPillClasses(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100";
    case "PROCESSING":
      return "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100";
    case "ASSIGNED":
      return "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100";
    case "SCHEDULED":
      return "bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100";
    case "COMPLETED":
      return "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100";
    case "DECLINED":
      return "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100";
    default:
      return "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100";
  }
}

/** Colored pill classes for priority */
function priorityPillClasses(priority?: string) {
  switch ((priority || "").toUpperCase()) {
    case "LOW":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100";
    case "MEDIUM":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100";
    case "HIGH":
      return "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100";
    case "URGENT":
      return "bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100";
    default:
      return "bg-muted text-foreground";
  }
}

/** Detect presence of any attachments across common fields */
function hasAnyFiles(t: any) {
  const pools = [
    t?.attachments,
    t?.files,
    t?.media,
    t?.images,
    t?.videos,
    t?.documents,
  ];
  return pools.some((arr: any) =>
    Array.isArray(arr) ? arr.length > 0 : !!arr
  );
}

const TicketCard: FC<{ ticket: Ticket }> = ({ ticket }) => {
  // Extend typing a bit to surface optional fields
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
  } = ticket as any;

  const imageCount = Array.isArray(images) ? images.length : 0;
  const videoCount = Array.isArray(videos) ? videos.length : 0;
  const docCount = Array.isArray(documents) ? documents.length : 0;
  const attachCount = Array.isArray(attachments) ? attachments.length : 0;
  const filesCount = Array.isArray(files) ? files.length : 0;
  const mediaCount = Array.isArray(media) ? media.length : 0;
  const totalAttachments =
    imageCount + videoCount + docCount + attachCount + filesCount + mediaCount;

  return (
    <Card className="w-full transition hover:shadow-md cursor-pointer">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <time title={String(createdAt)}>{formatDate(createdAt)}</time>
            {area ? (
              <Badge
                variant="outline"
                title={area}
                className="max-w-[180px] truncate"
              >
                {area}
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
          <CiUser aria-hidden />
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
            <Modal>
              <TicketActions ticket={ticket} />
            </Modal>
          </section>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TicketCard;
