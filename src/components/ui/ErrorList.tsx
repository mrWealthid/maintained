"use client";

import {
  AlertTriangle,
  ChevronDown,
  Copy,
  Check,
  X,
  Clock,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { scrollElementIntoView } from "@/lib/helpers/scroll-to-element";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/* ------------------------------------------------------------------ */
/*  Types – mirrors your ApiErrorHandler types                         */
/* ------------------------------------------------------------------ */

type ValidationIssue = {
  path: (string | number)[];
  message: string;
  code?: string;
  expected?: string;
  received?: string;
  field?: string;
};

type ApiErrorBody<T = unknown> = {
  ok: false;
  name: string;
  message: string;
  status: number;
  code: string;
  kind: string;
  issues?: ValidationIssue[];
  details?: T;
  requestId?: string;
  timestamp: string;
};

/**
 * The component accepts any of:
 *  - A full `ApiErrorBody` object
 *  - The return value of `ApiErrorHandler.extract()` → `{ message, issues?, requestId? }`
 *  - A plain `{ message, issues? }` object
 *  - A plain string (e.g. from `ApiErrorHandler.parse()`)
 */
type ErrorInput =
  | ApiErrorBody
  | { message: string; issues?: ValidationIssue[]; requestId?: string }
  | string
  | null
  | undefined;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isApiErrorBody(x: unknown): x is ApiErrorBody {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return (
    obj.ok === false &&
    typeof obj.message === "string" &&
    typeof obj.code === "string"
  );
}

function extractFromInput(error: ErrorInput): {
  message: string;
  issues: ValidationIssue[];
  requestId?: string;
  status?: number;
  code?: string;
  timestamp?: string;
} {
  if (!error) return { message: "An unexpected error occurred", issues: [] };
  if (typeof error === "string") return { message: error, issues: [] };

  if (isApiErrorBody(error)) {
    return {
      message: error.message,
      issues: error.issues ?? [],
      requestId: error.requestId,
      status: error.status,
      code: error.code,
      timestamp: error.timestamp,
    };
  }

  // extract() shape or generic { message, issues? }
  return {
    message: error.message || "An error occurred",
    issues: error.issues ?? [],
    requestId: error.requestId,
  };
}

function humanizeField(issue: ValidationIssue): string {
  const last =
    issue.field ||
    (issue.path?.length
      ? String(issue.path[issue.path.length - 1])
      : undefined);
  if (!last) return "Field";
  const key = String(last);
  return key
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function humanizePath(issue: ValidationIssue): string | null {
  if (!issue.path || issue.path.length === 0) return null;
  return issue.path.join(" > ");
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

/* ------------------------------------------------------------------ */
/*  Issue row                                                          */
/* ------------------------------------------------------------------ */

function ErrorIssueRow({
  issue,
  index,
}: {
  issue: ValidationIssue;
  index: number;
}) {
  const extra: string[] = [];
  if (issue.expected) extra.push(`Expected: ${issue.expected}`);
  if (issue.received) extra.push(`Received: ${issue.received}`);
  const path = humanizePath(issue);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md px-3 py-3 transition-colors",
        index % 2 === 0 ? "bg-destructive/3" : "bg-transparent",
      )}
    >
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-[11px] font-semibold text-destructive">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {humanizeField(issue)}
          </span>
          {issue.code && (
            <Badge
              variant="outline"
              className="border-destructive/20 bg-destructive/5 text-destructive text-[10px] px-1.5 py-0 font-mono"
            >
              {issue.code}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
          {issue.message}
        </p>
        {extra.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
            {extra.map((e, i) => (
              <span
                key={i}
                className="text-xs text-muted-foreground/70 font-mono"
              >
                {e}
              </span>
            ))}
          </div>
        )}
        {path && (
          <p
            className="mt-1 text-[11px] text-muted-foreground/50 font-mono truncate"
            title={path}
          >
            {path}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export interface ErrorListProps {
  /** The error object: ApiErrorBody, extract() result, or a plain string */
  error?: ErrorInput;
  /** Override the heading. Defaults to the error message */
  title?: string;
  /** Called when the user dismisses the alert */
  onDismiss?: () => void;
  /** Additional className for the root container */
  className?: string;
  /** Start collapsed (default: expanded) */
  defaultOpen?: boolean;
  /** Auto-scroll to the error when it renders */
  autoScroll?: boolean;
}

export default function ErrorList({
  error,
  title,
  onDismiss,
  className,
  defaultOpen = true,
  autoScroll = true,
}: ErrorListProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const extracted = useMemo(() => extractFromInput(error), [error]);
  const heading = title || extracted.message;

  // IMPORTANT: keep a stable “hasIssues” check so the message shows even without issues.
  const issues = (extracted.issues ?? []).filter((i) => i && i.message);
  const hasIssues = issues.length > 0;

  useEffect(() => {
    if (!error || !autoScroll || !rootRef.current) return;

    const animationFrame = window.requestAnimationFrame(() => {
      if (!rootRef.current) return;

      scrollElementIntoView(rootRef.current, {
        behavior: "smooth",
        block: "start",
        offset: 24,
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [autoScroll, error]);

  const handleCopy = () => {
    const lines = issues.map(
      (it, i) =>
        `${i + 1}. ${humanizeField(it)}: ${it.message}${
          it.code ? ` (${it.code})` : ""
        }${it.expected ? ` [expected: ${it.expected}]` : ""}${
          it.received ? ` [received: ${it.received}]` : ""
        }`,
    );

    // Include the heading + meta even when issues are absent (copy still only enabled when hasIssues)
    const parts: string[] = [heading];

    if (extracted.status) parts.push(`Status: ${extracted.status}`);
    if (extracted.code) parts.push(`Code: ${extracted.code}`);
    if (extracted.requestId) parts.push(`Request ID: ${extracted.requestId}`);
    if (extracted.timestamp) parts.push(`Timestamp: ${extracted.timestamp}`);

    parts.push(""); // spacer
    parts.push(...lines);

    navigator.clipboard.writeText(parts.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!error) return null;

  return (
    <div
      ref={rootRef}
      role="alert"
      aria-live="assertive"
      className={cn(
        "rounded-lg border  border-destructive/20 bg-background shadow-sm overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 bg-destructive/6 px-4 py-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-snug text-pretty">
            {heading}
          </p>

          {/* NEW: show the message even when there are no issues */}
          {!hasIssues && extracted.message && (
            <p className="mt-1 text-sm  text-muted-foreground leading-relaxed">
              {extracted.message}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {hasIssues ? (
              <span className="text-xs text-muted-foreground">
                {issues.length} {issues.length === 1 ? "issue" : "issues"} found
              </span>
            ) : null}

            {extracted.status && (
              <Badge
                variant="outline"
                className="border-muted-foreground/20 text-muted-foreground text-[10px] px-1.5 py-0 font-mono"
              >
                {extracted.status}
              </Badge>
            )}

            {extracted.code && (
              <Badge
                variant="outline"
                className="border-muted-foreground/20 text-muted-foreground text-[10px] px-1.5 py-0 font-mono"
              >
                {extracted.code}
              </Badge>
            )}
          </div>

          {/* requestId + timestamp */}
          {(extracted.requestId || extracted.timestamp) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/60 font-mono">
              {extracted.requestId && (
                <span title="Request ID">ID: {extracted.requestId}</span>
              )}
              {extracted.timestamp && (
                <span className="flex items-center gap-1" title="Timestamp">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(extracted.timestamp)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {hasIssues && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-foreground transition-colors"
              aria-label="Copy errors to clipboard"
              title="Copy errors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-foreground transition-colors"
              aria-label="Dismiss errors"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Issues list */}
      {hasIssues && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="border-t border-destructive/10">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
              >
                <span>{isOpen ? "Hide" : "Show"} details</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="border-t border-destructive/10 px-2 py-1">
                {issues.map((issue, idx) => (
                  <ErrorIssueRow key={idx} issue={issue} index={idx} />
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </div>
  );
}
