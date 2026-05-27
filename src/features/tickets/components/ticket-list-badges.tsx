import { Flag } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  TECHNICIAN_RESPONSE,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "@/shared/enums/enums";
import {
  TICKET_PRIORITY_META,
  TICKET_STATUS_META,
} from "@/features/tickets/data/list-data";

type BadgeConfig = {
  label: string;
  className: string;
};

const baseBadgeClassName =
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium";

const priorityBadgeClassName = cn(baseBadgeClassName, "gap-1");

const TECHNICIAN_RESPONSE_BADGES = {
  [TECHNICIAN_RESPONSE.pending]: {
    label: "Pending",
    className: "bg-status-open text-status-open-foreground",
  },
  [TECHNICIAN_RESPONSE.applied]: {
    label: "Applied",
    className: "bg-status-progress text-status-progress-foreground",
  },
  [TECHNICIAN_RESPONSE.selected]: {
    label: "Selected",
    className: "bg-status-resolved text-status-resolved-foreground",
  },
  [TECHNICIAN_RESPONSE.inspection_requested]: {
    label: "Inspection Requested",
    className: "bg-status-progress text-status-progress-foreground",
  },
  [TECHNICIAN_RESPONSE.declined]: {
    label: "Declined",
    className: "bg-status-overdue text-status-overdue-foreground",
  },
  [TECHNICIAN_RESPONSE.all]: {
    label: "All",
    className: "bg-muted text-muted-foreground",
  },
} satisfies Record<TECHNICIAN_RESPONSE, BadgeConfig>;

function ToneBadge({ config }: { config?: BadgeConfig }) {
  if (!config) {
    return (
      <span className={cn(baseBadgeClassName, "bg-muted text-muted-foreground")}>
        Not set
      </span>
    );
  }

  return (
    <span className={cn(baseBadgeClassName, config.className)}>
      {config.label}
    </span>
  );
}

export function TicketStatusBadge({ status }: { status?: TICKET_STATUS }) {
  const meta = status
    ? (TICKET_STATUS_META as Record<string, BadgeConfig | undefined>)[status]
    : undefined;

  return <ToneBadge config={meta} />;
}

export function TicketPriorityBadge({
  priority,
}: {
  priority?: TICKET_PRIORITY;
}) {
  const meta = priority
    ? (TICKET_PRIORITY_META as Record<string, BadgeConfig | undefined>)[priority]
    : undefined;

  if (!meta) return <ToneBadge />;

  return (
    <span className={cn(priorityBadgeClassName, meta.className)}>
      <Flag className="h-3 w-3" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function TechnicianRequestStatusBadge({
  status,
}: {
  status?: TECHNICIAN_RESPONSE;
}) {
  return (
    <ToneBadge
      config={status ? TECHNICIAN_RESPONSE_BADGES[status] : undefined}
    />
  );
}
