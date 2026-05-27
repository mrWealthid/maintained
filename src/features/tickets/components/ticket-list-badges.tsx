import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TECHNICIAN_RESPONSE,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "@/shared/enums/enums";

type BadgeConfig = {
  label: string;
  className: string;
};

const baseBadgeClassName =
  "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5";

const TICKET_STATUS_BADGES = {
  [TICKET_STATUS.pending]: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  [TICKET_STATUS.processing]: {
    label: "Processing",
    className:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300",
  },
  [TICKET_STATUS.pending_assignment]: {
    label: "Pending Assignment",
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300",
  },
  [TICKET_STATUS.assigned]: {
    label: "Assigned",
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-300",
  },
  [TICKET_STATUS.scheduled]: {
    label: "Scheduled",
    className:
      "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-300",
  },
  [TICKET_STATUS.completed]: {
    label: "Completed",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  [TICKET_STATUS.declined]: {
    label: "Declined",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
  },
  [TICKET_STATUS.all]: {
    label: "All",
    className:
      "border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground",
  },
} satisfies Record<TICKET_STATUS, BadgeConfig>;

const TICKET_PRIORITY_BADGES = {
  [TICKET_PRIORITY.emergency]: {
    label: "Emergency",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
  },
  [TICKET_PRIORITY.high]: {
    label: "High",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300",
  },
  [TICKET_PRIORITY.medium]: {
    label: "Medium",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  [TICKET_PRIORITY.low]: {
    label: "Low",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
} satisfies Record<TICKET_PRIORITY, BadgeConfig>;

const TECHNICIAN_RESPONSE_BADGES = {
  [TECHNICIAN_RESPONSE.pending]: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  [TECHNICIAN_RESPONSE.applied]: {
    label: "Applied",
    className:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300",
  },
  [TECHNICIAN_RESPONSE.selected]: {
    label: "Selected",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  [TECHNICIAN_RESPONSE.inspection_requested]: {
    label: "Inspection Requested",
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300",
  },
  [TECHNICIAN_RESPONSE.declined]: {
    label: "Declined",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
  },
  [TECHNICIAN_RESPONSE.all]: {
    label: "All",
    className:
      "border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground",
  },
} satisfies Record<TECHNICIAN_RESPONSE, BadgeConfig>;

function ToneBadge({ config }: { config?: BadgeConfig }) {
  if (!config) {
    return (
      <Badge
        variant="outline"
        className={cn(
          baseBadgeClassName,
          "border-border bg-muted text-muted-foreground",
        )}
      >
        Not set
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(baseBadgeClassName, config.className)}
    >
      {config.label}
    </Badge>
  );
}

export function TicketStatusBadge({ status }: { status?: TICKET_STATUS }) {
  return <ToneBadge config={status ? TICKET_STATUS_BADGES[status] : undefined} />;
}

export function TicketPriorityBadge({
  priority,
}: {
  priority?: TICKET_PRIORITY;
}) {
  return (
    <ToneBadge config={priority ? TICKET_PRIORITY_BADGES[priority] : undefined} />
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
