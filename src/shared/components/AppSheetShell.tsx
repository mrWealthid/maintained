"use client";

import type { ComponentType, ReactNode } from "react";

import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type SheetTone = "default" | "destructive";

type AppSheetContentProps = React.ComponentProps<typeof SheetContent>;

type AppSheetHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  tone?: SheetTone;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  iconClassName?: string;
  iconWrapClassName?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
};

type AppSheetBodyProps = React.ComponentProps<"div"> & {
  scrollAreaClassName?: string;
  padded?: boolean;
};

function getToneClasses(tone: SheetTone) {
  return tone === "destructive"
    ? "border-destructive/40 bg-destructive text-destructive dark:border-destructive/40/40 dark:bg-destructive/30 dark:text-destructive"
    : "border-primary/15 bg-primary/5 text-primary";
}

export function AppSheetContent({
  className,
  ...props
}: AppSheetContentProps) {
  return (
    <SheetContent
      className={cn(
        "flex h-full min-h-0 w-full max-w-[100vw] flex-col gap-0 overflow-hidden p-0",
        className,
      )}
      {...props}
    />
  );
}

export function AppSheetHeader({
  title,
  description,
  icon: Icon,
  tone = "default",
  className,
  titleClassName,
  descriptionClassName,
  iconClassName,
  iconWrapClassName,
  eyebrow,
  actions,
}: AppSheetHeaderProps) {
  return (
    <SheetHeader
      className={cn(
        "shrink-0 border-b border-border bg-card/80 px-4 pb-4 pt-4 pr-12 text-left sm:px-5 sm:pb-5 sm:pt-5 sm:pr-14 lg:px-6 lg:pb-5 lg:pt-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full border",
                getToneClasses(tone),
                iconWrapClassName,
              )}
            >
              <Icon className={cn("size-5", iconClassName)} />
            </div>
          ) : null}

          <div className="min-w-0 space-y-1.5">
            {eyebrow ? <div className="flex flex-wrap gap-2">{eyebrow}</div> : null}
            <SheetTitle
              className={cn(
                "text-lg leading-tight font-semibold tracking-tight sm:text-xl",
                titleClassName,
              )}
            >
              {title}
            </SheetTitle>
            {description ? (
              <SheetDescription
                className={cn(
                  "max-w-2xl text-sm leading-5 text-muted-foreground sm:leading-6",
                  descriptionClassName,
                )}
              >
                {description}
              </SheetDescription>
            ) : null}
          </div>
        </div>

        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </SheetHeader>
  );
}

export function AppSheetBody({
  className,
  scrollAreaClassName,
  padded = true,
  ...props
}: AppSheetBodyProps) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] [touch-action:pan-y]",
        scrollAreaClassName,
      )}
    >
      <div
        className={cn("space-y-6", padded && "p-6", className)}
        {...props}
      />
    </div>
  );
}

export function AppSheetFooter({
  className,
  ...props
}: React.ComponentProps<typeof SheetFooter>) {
  return (
    <SheetFooter
      className={cn(
        "mt-0 shrink-0 border-t border-border bg-card/60 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    />
  );
}
