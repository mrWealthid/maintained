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
    className: "border-amber-500/30 bg-amber-500/8 text-amber-700",
  },
  [TICKET_STATUS.processing]: {
    label: "Processing",
    className: "border-sky-500/30 bg-sky-500/8 text-sky-700",
  },
  [TICKET_STATUS.pending_assignment]: {
    label: "Pending Assignment",
    className: "border-violet-500/30 bg-violet-500/8 text-violet-700",
  },
  [TICKET_STATUS.assigned]: {
    label: "Assigned",
    className: "border-cyan-500/30 bg-cyan-500/8 text-cyan-700",
  },
  [TICKET_STATUS.scheduled]: {
    label: "Scheduled",
    className: "border-teal-500/30 bg-teal-500/8 text-teal-700",
  },
  [TICKET_STATUS.completed]: {
    label: "Completed",
    className: "border-emerald-500/30 bg-emerald-500/8 text-emerald-700",
  },
  [TICKET_STATUS.declined]: {
    label: "Declined",
    className: "border-slate-500/30 bg-slate-500/8 text-slate-700",
  },
  [TICKET_STATUS.all]: {
    label: "All",
    className: "border-border bg-muted text-muted-foreground",
  },
} satisfies Record<TICKET_STATUS, { label: string; className: string }>;

const PRIORITY_CONFIG = {
  [TICKET_PRIORITY.emergency]: {
    label: "Emergency",
    className: "border-red-600/30 bg-red-600/10 text-red-700",
  },
  [TICKET_PRIORITY.high]: {
    label: "High",
    className: "border-rose-500/30 bg-rose-500/8 text-rose-700",
  },
  [TICKET_PRIORITY.medium]: {
    label: "Medium",
    className: "border-amber-500/30 bg-amber-500/8 text-amber-700",
  },
  [TICKET_PRIORITY.low]: {
    label: "Low",
    className: "border-emerald-500/30 bg-emerald-500/8 text-emerald-700",
  },
} satisfies Record<TICKET_PRIORITY, { label: string; className: string }>;

const REQUEST_STATUS_CONFIG = {
  [TECHNICIAN_RESPONSE.pending]: {
    label: "Pending",
    className: "border-amber-500/30 bg-amber-500/8 text-amber-700",
  },
  [TECHNICIAN_RESPONSE.applied]: {
    label: "Applied",
    className: "border-sky-500/30 bg-sky-500/8 text-sky-700",
  },
  [TECHNICIAN_RESPONSE.declined]: {
    label: "Declined",
    className: "border-slate-500/30 bg-slate-500/8 text-slate-700",
  },
  [TECHNICIAN_RESPONSE.selected]: {
    label: "Selected",
    className: "border-emerald-500/30 bg-emerald-500/8 text-emerald-700",
  },
  [TECHNICIAN_RESPONSE.inspection_requested]: {
    label: "Inspection",
    className: "border-violet-500/30 bg-violet-500/8 text-violet-700",
  },
  [TECHNICIAN_RESPONSE.all]: {
    label: "All",
    className: "border-border bg-muted text-muted-foreground",
  },
} satisfies Record<TECHNICIAN_RESPONSE, { label: string; className: string }>;

export function DashboardSectionHeader({
  title,
  icon: Icon,
  action,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

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
  tone?: "neutral" | "warning" | "critical" | "success" | "info";
  helper?: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <div className="mt-1.5 text-xl font-semibold leading-none">
            {value}
          </div>
          {helper ? (
            <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
              {helper}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
            tone === "critical" && "bg-rose-500/10 text-rose-600",
            tone === "warning" && "bg-amber-500/10 text-amber-600",
            tone === "success" && "bg-emerald-500/10 text-emerald-600",
            tone === "info" && "bg-sky-500/10 text-sky-600",
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: TICKET_STATUS }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("rounded px-1.5 py-0 text-[10px]", config.className)}>
      {config.label}
    </Badge>
  );
}

export function PriorityPill({ priority }: { priority: TICKET_PRIORITY }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge variant="outline" className={cn("rounded px-1.5 py-0 text-[10px]", config.className)}>
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
    <Badge variant="outline" className={cn("rounded px-1.5 py-0 text-[10px]", config.className)}>
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
    <div className="h-1.5 w-full rounded-full bg-muted">
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
    <div className="group flex items-start gap-2 rounded-md border p-2.5 transition-colors hover:bg-muted/40">
      <Icon className={cn("mt-0.5 size-3.5 shrink-0", getInsightClassName(insight.tone))} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold">{insight.title}</p>
          {insight.value !== undefined ? (
            <span className="shrink-0 text-xs font-semibold">
              {insight.value}
            </span>
          ) : (
            <ArrowRight className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
        <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
          {insight.detail}
        </p>
        {insight.action ? (
          <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
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
        "inline-flex items-center gap-1 text-[10px] font-medium",
        value > 0 && "text-emerald-600",
        value < 0 && "text-rose-600",
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
    <div className="rounded-md border p-2">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
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
        "flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 px-6 py-8 text-center",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-md bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <Icon className="size-5" />
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
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

function getInsightClassName(tone: DashboardInsight["tone"]) {
  if (tone === "success") return "text-emerald-600";
  if (tone === "critical") return "text-rose-600";
  if (tone === "warning") return "text-amber-600";
  return "text-sky-600";
}
