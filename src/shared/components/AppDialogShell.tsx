"use client";

import type { ComponentType, ReactNode } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DialogTone = "default" | "destructive";

type AppDialogContentProps = React.ComponentProps<typeof DialogContent>;

type AppDialogHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  tone?: DialogTone;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actions?: ReactNode;
};

type AppDialogSectionProps = React.ComponentProps<"div">;

function getToneClasses(tone: DialogTone) {
  return tone === "destructive"
    ? "border-destructive/40 bg-destructive/10 text-destructive"
    : "border-primary/30 bg-primary/10 text-primary";
}

export function AppDialogContent({ className, ...props }: AppDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        "flex max-h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-h-[calc(100dvh-2rem)] sm:w-full sm:max-w-2xl sm:rounded-lg sm:border",
        className,
      )}
      {...props}
    />
  );
}

export function AppDialogHeader({
  title,
  description,
  icon: Icon,
  tone = "default",
  className,
  titleClassName,
  descriptionClassName,
  actions,
}: AppDialogHeaderProps) {
  return (
    <DialogHeader
      className={cn(
        "shrink-0 border-b bg-card/95 px-4 py-4 pr-12 sm:px-6 sm:py-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3 text-left">
          {Icon ? (
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full border",
                getToneClasses(tone),
              )}
            >
              <Icon className="size-5" />
            </div>
          ) : null}

          <div className="min-w-0 space-y-1">
            <DialogTitle
              className={cn("text-xl leading-tight font-semibold tracking-tight", titleClassName)}
            >
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription
                className={cn("text-sm leading-6 text-muted-foreground", descriptionClassName)}
              >
                {description}
              </DialogDescription>
            ) : null}
          </div>
        </div>

        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </DialogHeader>
  );
}

export function AppDialogBody({ className, ...props }: AppDialogSectionProps) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 [-webkit-overflow-scrolling:touch] [touch-action:pan-y] sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function AppDialogFooter({ className, ...props }: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn(
        "shrink-0 border-t bg-card/95 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-4",
        className,
      )}
      {...props}
    />
  );
}
