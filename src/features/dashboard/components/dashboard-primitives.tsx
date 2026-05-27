"use client";

import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TECHNICIAN_RESPONSE,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "@/shared/enums/enums";
import type { DashboardInsight } from "../models/dashboard.model";
import {
  formatDashboardCurrency,
  labelizeDashboardValue,
} from "../helper/dashboard-view.helper";

const STATUS_CONFIG = {
  [TICKET_STATUS.pending]: {
    label: "Pending",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  [TICKET_STATUS.processing]: {
    label: "Processing",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  },
  [TICKET_STATUS.pending_assignment]: {
    label: "Pending Assignment",
    className: "border-violet-500/30 bg-violet-500/10 text-violet-600",
  },
  [TICKET_STATUS.assigned]: {
    label: "Assigned",
    className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600",
  },
  [TICKET_STATUS.scheduled]: {
    label: "Scheduled",
    className: "border-teal-500/30 bg-teal-500/10 text-teal-600",
  },
  [TICKET_STATUS.completed]: {
    label: "Completed",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  },
  [TICKET_STATUS.declined]: {
    label: "Declined",
    className: "border-slate-500/30 bg-slate-500/10 text-slate-600",
  },
  [TICKET_STATUS.all]: {
    label: "All",
    className: "border-border bg-muted text-muted-foreground",
  },
} satisfies Record<TICKET_STATUS, { label: string; className: string }>;

const PRIORITY_CONFIG = {
  [TICKET_PRIORITY.emergency]: {
    label: "Emergency",
    className: "border-red-600/30 bg-red-600/10 text-red-600",
  },
  [TICKET_PRIORITY.high]: {
    label: "High",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-600",
  },
  [TICKET_PRIORITY.medium]: {
    label: "Medium",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  [TICKET_PRIORITY.low]: {
    label: "Low",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  },
} satisfies Record<TICKET_PRIORITY, { label: string; className: string }>;

const REQUEST_STATUS_CONFIG = {
  [TECHNICIAN_RESPONSE.pending]: {
    label: "Pending",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  [TECHNICIAN_RESPONSE.applied]: {
    label: "Applied",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  },
  [TECHNICIAN_RESPONSE.declined]: {
    label: "Declined",
    className: "border-slate-500/30 bg-slate-500/10 text-slate-600",
  },
  [TECHNICIAN_RESPONSE.selected]: {
    label: "Selected",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  },
  [TECHNICIAN_RESPONSE.inspection_requested]: {
    label: "Inspection",
    className: "border-violet-500/30 bg-violet-500/10 text-violet-600",
  },
  [TECHNICIAN_RESPONSE.all]: {
    label: "All",
    className: "border-border bg-muted text-muted-foreground",
  },
} satisfies Record<TECHNICIAN_RESPONSE, { label: string; className: string }>;

const STAT_TONE_CLASSES = {
  neutral: "bg-muted text-muted-foreground",
  critical: "bg-rose-500/10 text-rose-500",
  warning: "bg-amber-500/10 text-amber-500",
  success: "bg-emerald-500/10 text-emerald-500",
  info: "bg-sky-500/10 text-sky-500",
} as const;

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  helper,
}: {
  label: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  tone?: keyof typeof STAT_TONE_CLASSES;
  helper?: string;
}) {
  return (
    <Card className="border-border bg-card transition-colors hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={cn("rounded-lg p-2.5", STAT_TONE_CLASSES[tone])}>
            <Icon className="size-5" />
          </div>
        </div>
        {helper ? (
          <p className="mt-3 truncate text-xs text-muted-foreground">{helper}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: TICKET_STATUS }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border-0 px-2 py-0.5 text-[11px] font-medium",
        config.className,
      )}
    >
      {config.label}
    </Badge>
  );
}

export function PriorityPill({ priority }: { priority: TICKET_PRIORITY }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border-0 px-2 py-0.5 text-[11px] font-medium",
        config.className,
      )}
    >
      {config.label}
    </Badge>
  );
}

export function RequestStatusBadge({
  status,
}: {
  status: TECHNICIAN_RESPONSE;
}) {
  const config = REQUEST_STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border-0 px-2 py-0.5 text-[11px] font-medium",
        config.className,
      )}
    >
      {config.label}
    </Badge>
  );
}

export function MiniBar({
  value,
  total,
  className,
}: {
  value: number;
  total: number;
  className?: string;
}) {
  const width = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full bg-primary", className)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function InsightRow({ insight }: { insight: DashboardInsight }) {
  const Icon = getInsightIcon(insight.tone);
  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border/60 bg-card/50 p-3 transition-colors hover:border-primary/30">
      <div
        className={cn(
          "rounded-lg p-1.5",
          getInsightWrapClassName(insight.tone),
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {insight.title}
          </p>
          {insight.value !== undefined ? (
            <span className="shrink-0 text-sm font-semibold text-foreground">
              {insight.value}
            </span>
          ) : (
            <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {insight.detail}
        </p>
        {insight.action ? (
          <div className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {insight.action}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MetricDelta({ value }: { value?: number }) {
  if (value === undefined) return null;
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        value > 0 && "text-emerald-500",
        value < 0 && "text-rose-500",
        value === 0 && "text-muted-foreground",
      )}
    >
      <Icon className="size-3" />
      {Math.abs(value)}%
    </span>
  );
}

export function CurrencyValue({ value }: { value: number | null | undefined }) {
  return <>{formatDashboardCurrency(value ?? null)}</>;
}

export function LabelValue({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-3">
      <div className="text-sm font-semibold text-foreground">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <Icon className="size-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function getRequestStatusLabel(status: TECHNICIAN_RESPONSE) {
  return REQUEST_STATUS_CONFIG[status]?.label ?? labelizeDashboardValue(status);
}

function getInsightIcon(tone: DashboardInsight["tone"]) {
  if (tone === "success") return CheckCircle2;
  if (tone === "critical") return AlertTriangle;
  if (tone === "warning") return AlertTriangle;
  return Info;
}

function getInsightWrapClassName(tone: DashboardInsight["tone"]) {
  if (tone === "success") return "bg-emerald-500/10 text-emerald-500";
  if (tone === "critical") return "bg-rose-500/10 text-rose-500";
  if (tone === "warning") return "bg-amber-500/10 text-amber-500";
  return "bg-sky-500/10 text-sky-500";
}
