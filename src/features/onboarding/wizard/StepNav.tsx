"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type WizardStep = {
  id: string;
  label: string;
  description: string;
};

type Props = {
  steps: WizardStep[];
  currentIndex: number;
  completed: Set<string>;
  onNavigate?: (index: number) => void;
};

export default function StepNav({
  steps,
  currentIndex,
  completed,
  onNavigate,
}: Props) {
  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <ol className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-3">
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = completed.has(step.id);
          const isReachable =
            isComplete || index <= currentIndex || index === currentIndex + 1;
          const Tag: "button" | "div" =
            onNavigate && isReachable ? "button" : "div";

          return (
            <li key={step.id} className="flex-1">
              <Tag
                {...(Tag === "button"
                  ? {
                      type: "button" as const,
                      onClick: () => onNavigate?.(index),
                      disabled: !isReachable,
                    }
                  : {})}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition",
                  isCurrent
                    ? "border-primary shadow-sm"
                    : "border-border/70 hover:border-border",
                  Tag === "button" &&
                    !isCurrent &&
                    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  Tag === "div" && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                    isComplete
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium leading-none">
                    {step.label}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {step.description}
                  </span>
                </span>
              </Tag>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
