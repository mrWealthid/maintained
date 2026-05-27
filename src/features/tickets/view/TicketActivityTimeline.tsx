"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Edit3,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  Tag,
  UserCheck,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { http } from "@/services/http";

type ActivityAction =
  | "created"
  | "updated"
  | "assigned"
  | "commented"
  | "completed"
  | "status-changed"
  | "type-changed"
  | "actioned-by";

type Activity = {
  id?: string;
  _id?: string;
  ticket: string;
  action: ActivityAction;
  description?: string;
  changedBy?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    photo?: string;
  } | null;
  metadata?: Record<string, unknown>;
  timestamp?: string;
  createdAt?: string;
};

const ICON_BY_ACTION: Record<ActivityAction, React.ComponentType<{ className?: string }>> = {
  created: PlusCircle,
  updated: Edit3,
  assigned: UserCheck,
  commented: MessageSquare,
  completed: CheckCircle2,
  "status-changed": RefreshCw,
  "type-changed": Tag,
  "actioned-by": UserCheck,
};

const COLOR_BY_ACTION: Record<ActivityAction, string> = {
  created: "bg-primary/10 text-primary",
  updated: "bg-muted text-muted-foreground",
  assigned: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  commented: "bg-muted text-muted-foreground",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "status-changed": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "type-changed": "bg-muted text-muted-foreground",
  "actioned-by": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

async function fetchActivity(ticketSlug: string): Promise<Activity[]> {
  const { data } = await http.get(`/api/tickets/activity-log/${ticketSlug}`);
  return (data?.data as Activity[]) ?? [];
}

function formatTime(iso: string | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TicketActivityTimeline({
  ticketSlug,
}: {
  ticketSlug: string;
}) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["ticket-activity", ticketSlug],
    queryFn: () => fetchActivity(ticketSlug),
    enabled: Boolean(ticketSlug),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <Skeleton className="mt-1 h-8 w-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center">
        <Clock
          className="mx-auto h-7 w-7 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm font-medium">No activity yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Updates to this ticket will appear here.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative ml-5 space-y-4 border-l border-border/60 pl-8">
      {activities.map((activity, idx) => {
        const Icon = ICON_BY_ACTION[activity.action] ?? Edit3;
        const color = COLOR_BY_ACTION[activity.action] ?? "bg-muted text-muted-foreground";
        const who = activity.changedBy?.name ?? "Someone";
        const when = formatTime(activity.timestamp ?? activity.createdAt);
        return (
          <li
            key={activity.id ?? activity._id ?? idx}
            className="relative"
          >
            <span
              className={`absolute left-[-46px] top-1 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background ${color}`}
              aria-hidden="true"
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="rounded-lg border bg-card px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">
                  <span>{who}</span>{" "}
                  <span className="font-normal text-muted-foreground">
                    {activity.action.replace(/-/g, " ")}
                  </span>
                </p>
                <span className="text-xs text-muted-foreground">{when}</span>
              </div>
              {activity.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {activity.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
