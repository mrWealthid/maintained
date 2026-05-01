"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DEFAULT_PASSWORD_POLICY,
  assessPasswordStrength,
  type PasswordPolicy,
} from "@/lib/security/password-policy.shared";

type PasswordStrengthIndicatorProps = {
  password: string;
  policy?: PasswordPolicy;
  className?: string;
  title?: string;
};

const STRENGTH_SEGMENTS = 4;

function getStrengthTone(label: ReturnType<typeof assessPasswordStrength>["label"]) {
  switch (label) {
    case "Strong":
      return {
        badge:
          "border-status-resolved/40/25 bg-status-resolved/10 text-status-resolved dark:text-status-resolved",
        segment: "bg-status-resolved",
      };
    case "Good":
      return {
        badge: "border-primary/20 bg-primary/10 text-primary",
        segment: "bg-primary",
      };
    case "Fair":
      return {
        badge: "border-status-open/40/25 bg-status-open/10 text-status-open dark:text-status-open",
        segment: "bg-status-open",
      };
    default:
      return {
        badge:
          "border-destructive/20 bg-destructive/10 text-destructive dark:text-destructive",
        segment: "bg-destructive",
      };
  }
}

export function PasswordStrengthIndicator({
  password,
  policy = DEFAULT_PASSWORD_POLICY,
  className,
  title = "Password strength",
}: PasswordStrengthIndicatorProps) {
  const assessment = assessPasswordStrength(password, policy);
  const tone = getStrengthTone(assessment.label);
  const activeSegments =
    password.length === 0 ? 0 : Math.max(1, Math.ceil(assessment.score / 25));

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-muted/35 p-4",
        className,
      )}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{assessment.guidance}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
            tone.badge,
          )}
        >
          {assessment.label}
        </span>
      </div>

      <div
        className="mt-4 grid grid-cols-4 gap-2"
        role="presentation"
        aria-hidden="true"
      >
        {Array.from({ length: STRENGTH_SEGMENTS }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 rounded-full bg-border/70 transition-colors",
              index < activeSegments ? "bg-status-resolved" : "bg-border/70",
            )}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {assessment.requirements.map((requirement) => (
          <div
            key={requirement.key}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            {requirement.met ? (
              <CheckCircle2 className="size-4 shrink-0 text-status-resolved dark:text-status-resolved" />
            ) : (
              <Circle className="size-4 shrink-0 text-muted-foreground/70" />
            )}
            <span
              className={cn(
                requirement.met ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
