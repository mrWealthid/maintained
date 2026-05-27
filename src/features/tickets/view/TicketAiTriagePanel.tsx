"use client";

import {
  AlertOctagon,
  AlertTriangle,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Hourglass,
  Loader2,
  MessageSquare,
  Route,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  RefreshCw,
  Wrench,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AI_TRIAGE_STATUS } from "@/shared/enums/enums";
import type { TicketAiTriage } from "@/shared/model/model";
import { getTicketTypeLabel } from "@/shared/tickets/ticket-types";

type Props = {
  status?: AI_TRIAGE_STATUS;
  triage?: TicketAiTriage;
  error?: string;
  completedAt?: string;
  source?: string;
  isStaff: boolean;
  canReTriage?: boolean;
  isReTriaging?: boolean;
  onReTriage?: () => void;
};

function ReTriageButton({
  onReTriage,
  isReTriaging,
}: {
  onReTriage: () => void;
  isReTriaging?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onReTriage}
      disabled={isReTriaging}
      className="gap-1.5"
    >
      <RefreshCw className={cn("size-3.5", isReTriaging && "animate-spin")} />
      {isReTriaging ? "Re-queuing…" : "Re-run triage"}
    </Button>
  );
}

const RISK_STYLES: Record<string, { wrap: string; icon: string; label: string }> =
  {
    High: {
      wrap: "border-red-600/30 bg-red-600/10 text-red-600",
      icon: "text-red-600",
      label: "High Risk",
    },
    Medium: {
      wrap: "border-amber-500/30 bg-amber-500/10 text-amber-600",
      icon: "text-amber-600",
      label: "Medium Risk",
    },
    Low: {
      wrap: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
      icon: "text-emerald-600",
      label: "Low Risk",
    },
  };

function SectionHeader({
  icon: Icon,
  title,
  description,
  iconWrapClassName = "bg-primary/10",
  iconClassName = "text-primary",
  actions,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  iconWrapClassName?: string;
  iconClassName?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className={cn("rounded-xl p-2.5", iconWrapClassName)}>
          <Icon className={cn("size-5", iconClassName)} />
        </div>
        <div>
          <div className="text-base font-medium text-card-foreground">
            {title}
          </div>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

function Subsection({
  icon: Icon,
  title,
  iconClassName = "text-muted-foreground",
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn("size-4", iconClassName)} />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function BulletList({
  items,
  markerClassName = "bg-muted-foreground/40",
}: {
  items: string[];
  markerClassName?: string;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed">
          <span
            className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", markerClassName)}
          />
          <span className="text-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {idx + 1}
          </span>
          <span className="text-foreground">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function StatusShell({
  icon: Icon,
  iconWrapClassName,
  iconClassName,
  title,
  description,
  spin = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconWrapClassName: string;
  iconClassName: string;
  title: string;
  description: string;
  spin?: boolean;
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <SectionHeader
          icon={Bot}
          title="AI Triage"
          description="Automated assessment of this maintenance request."
          iconWrapClassName="bg-violet-500/10"
          iconClassName="text-violet-500"
        />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center">
          <div className={cn("rounded-xl p-3", iconWrapClassName)}>
            <Icon className={cn("size-6", iconClassName, spin && "animate-spin")} />
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TicketAiTriagePanel({
  status,
  triage,
  error,
  completedAt,
  source,
  isStaff,
  canReTriage,
  isReTriaging,
  onReTriage,
}: Props) {
  const showReTriage = Boolean(canReTriage && onReTriage);

  if (!status || status === AI_TRIAGE_STATUS.notStarted) {
    return null;
  }

  if (status === AI_TRIAGE_STATUS.pending) {
    return (
      <StatusShell
        icon={Hourglass}
        iconWrapClassName="bg-sky-500/10"
        iconClassName="text-sky-500"
        title="Triage queued"
        description="This request is waiting to be analyzed by the AI triage assistant."
      />
    );
  }

  if (status === AI_TRIAGE_STATUS.processing) {
    return (
      <StatusShell
        icon={Loader2}
        iconWrapClassName="bg-violet-500/10"
        iconClassName="text-violet-500"
        title="Analyzing request"
        description="The AI triage assistant is reviewing the details. This usually takes a moment."
        spin
      />
    );
  }

  if (status === AI_TRIAGE_STATUS.failed) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="space-y-4 p-5">
          <SectionHeader
            icon={Bot}
            title="AI Triage"
            description="Automated assessment of this maintenance request."
            iconWrapClassName="bg-violet-500/10"
            iconClassName="text-violet-500"
            actions={
              showReTriage ? (
                <ReTriageButton
                  onReTriage={onReTriage!}
                  isReTriaging={isReTriaging}
                />
              ) : undefined
            }
          />
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
            <XCircle className="mt-0.5 size-5 shrink-0 text-rose-600" />
            <div>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                Triage could not be completed
              </p>
              <p className="mt-1 text-xs leading-5 text-rose-700/80 dark:text-rose-400/80">
                {error ??
                  "The AI assistant was unable to analyze this request. A team member will review it manually."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!triage) {
    return null;
  }

  const risk = triage.safetyRisk ? RISK_STYLES[triage.safetyRisk] : undefined;
  const confidencePct =
    typeof triage.confidenceScore === "number"
      ? Math.round(triage.confidenceScore * 100)
      : undefined;
  const recommendedType = triage.recommendedTicketType
    ? getTicketTypeLabel(triage.recommendedTicketType)
    : undefined;

  const hasTenantContent =
    Boolean(triage.userReply) ||
    Boolean(triage.userTroubleshootingSteps?.length) ||
    Boolean(triage.safetyInstructions?.length);

  const diagnosis = triage.technicianDiagnosis ?? undefined;
  const hasDiagnosis =
    diagnosis &&
    (diagnosis.probableIssue ||
      diagnosis.inspectionPoints?.length ||
      diagnosis.recommendedTools?.length ||
      diagnosis.safetyNotes?.length);

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-5 p-5">
        <SectionHeader
          icon={Bot}
          title="AI Triage"
          description="Automated assessment of this maintenance request."
          iconWrapClassName="bg-violet-500/10"
          iconClassName="text-violet-500"
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge
                variant="secondary"
                className="gap-1 border-0 bg-emerald-500/10 text-emerald-600"
              >
                <BadgeCheck className="size-3" />
                Completed
              </Badge>
              {confidencePct !== undefined ? (
                <Badge
                  variant="secondary"
                  className="gap-1 border-0 bg-sky-500/10 text-sky-600"
                >
                  <Gauge className="size-3" />
                  {confidencePct}% confidence
                </Badge>
              ) : null}
              {showReTriage ? (
                <ReTriageButton
                  onReTriage={onReTriage!}
                  isReTriaging={isReTriaging}
                />
              ) : null}
            </div>
          }
        />

        {triage.immediateActionRequired ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-600/30 bg-red-600/10 p-4">
            <AlertOctagon className="mt-0.5 size-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Immediate action required
              </p>
              <p className="mt-1 text-xs leading-5 text-red-700/80 dark:text-red-400/80">
                This issue was flagged as urgent and should be addressed without
                delay.
              </p>
            </div>
          </div>
        ) : null}

        {/* Signal chips */}
        <div className="flex flex-wrap gap-2">
          {risk ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                risk.wrap,
              )}
            >
              <ShieldAlert className={cn("size-3.5", risk.icon)} />
              {risk.label}
            </span>
          ) : null}
          {triage.requiresTechnician ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600">
              <Wrench className="size-3.5" />
              Technician needed
            </span>
          ) : null}
          {triage.isMinorFix ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="size-3.5" />
              Minor fix
            </span>
          ) : null}
          {triage.estimatedResponseWindow ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Hourglass className="size-3.5" />
              {triage.estimatedResponseWindow}
            </span>
          ) : null}
          {triage.riskType?.map((rt) => (
            <span
              key={rt}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600"
            >
              {rt}
            </span>
          ))}
        </div>

        {/* Tenant-facing guidance — shown to everyone */}
        {hasTenantContent ? (
          <div className="space-y-3">
            {triage.userReply ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare className="size-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    What to expect
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {triage.userReply}
                </p>
              </div>
            ) : null}

            {triage.safetyInstructions?.length ? (
              <Subsection
                icon={ShieldAlert}
                title="Safety instructions"
                iconClassName="text-red-600"
              >
                <BulletList
                  items={triage.safetyInstructions}
                  markerClassName="bg-red-500"
                />
              </Subsection>
            ) : null}

            {triage.userTroubleshootingSteps?.length ? (
              <Subsection
                icon={Sparkles}
                title="Things you can try"
                iconClassName="text-sky-500"
              >
                <NumberedList items={triage.userTroubleshootingSteps} />
              </Subsection>
            ) : null}
          </div>
        ) : null}

        {/* Staff-only analysis */}
        {isStaff ? (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Internal analysis
                </p>
              </div>

              {triage.needsHumanReview ? (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      Needs human review
                    </p>
                    <p className="mt-1 text-xs leading-5 text-amber-700/80 dark:text-amber-400/80">
                      The assistant flagged this assessment for manual
                      confirmation before acting.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {recommendedType ? (
                  <Subsection
                    icon={ClipboardList}
                    title="Recommended type"
                    iconClassName="text-blue-500"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {recommendedType}
                    </p>
                    {triage.recommendedTicketTypeReason ? (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {triage.recommendedTicketTypeReason}
                      </p>
                    ) : null}
                  </Subsection>
                ) : null}

                {triage.priorityReason ? (
                  <Subsection
                    icon={Gauge}
                    title="Priority rationale"
                    iconClassName="text-amber-500"
                  >
                    <p className="text-sm leading-5 text-foreground">
                      {triage.priorityReason}
                    </p>
                  </Subsection>
                ) : null}

                {triage.routeTo ? (
                  <Subsection
                    icon={Route}
                    title="Suggested routing"
                    iconClassName="text-violet-500"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {triage.routeTo}
                    </p>
                  </Subsection>
                ) : null}

                {triage.missingInformation?.length ? (
                  <Subsection
                    icon={AlertTriangle}
                    title="Missing information"
                    iconClassName="text-rose-500"
                  >
                    <BulletList
                      items={triage.missingInformation}
                      markerClassName="bg-rose-500"
                    />
                  </Subsection>
                ) : null}
              </div>

              {hasDiagnosis ? (
                <Subsection
                  icon={Stethoscope}
                  title="Technician diagnosis"
                  iconClassName="text-emerald-500"
                >
                  <div className="space-y-3">
                    {diagnosis?.probableIssue ? (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Probable issue
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground">
                          {diagnosis.probableIssue}
                        </p>
                      </div>
                    ) : null}
                    {diagnosis?.inspectionPoints?.length ? (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Inspection points
                        </p>
                        <div className="mt-1.5">
                          <BulletList
                            items={diagnosis.inspectionPoints}
                            markerClassName="bg-emerald-500"
                          />
                        </div>
                      </div>
                    ) : null}
                    {diagnosis?.recommendedTools?.length ? (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Recommended tools
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {diagnosis.recommendedTools.map((tool) => (
                            <span
                              key={tool}
                              className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {diagnosis?.safetyNotes?.length ? (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Safety notes
                        </p>
                        <div className="mt-1.5">
                          <BulletList
                            items={diagnosis.safetyNotes}
                            markerClassName="bg-red-500"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Subsection>
              ) : null}

              {triage.adminNotes ? (
                <Subsection
                  icon={ClipboardList}
                  title="Admin notes"
                  iconClassName="text-muted-foreground"
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {triage.adminNotes}
                  </p>
                </Subsection>
              ) : null}

              <p className="text-[11px] text-muted-foreground">
                Analyzed
                {completedAt
                  ? ` ${new Date(completedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}`
                  : ""}
                {triage.analyzedBy ? ` · ${triage.analyzedBy}` : ""}
                {source ? ` · via ${source}` : ""}
              </p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
