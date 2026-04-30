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
};

type AppDialogSectionProps = React.ComponentProps<"div">;

function getToneClasses(tone: DialogTone) {
  return tone === "destructive"
    ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
    : "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300";
}

export function AppDialogContent({ className, ...props }: AppDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        "max-h-[calc(100dvh-1rem)] gap-0 overflow-hidden p-0 sm:max-h-[calc(100dvh-2rem)] sm:max-w-2xl",
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
}: AppDialogHeaderProps) {
  return (
    <DialogHeader
      className={cn("shrink-0 border-b px-6 py-5 pr-12", className)}
    >
      <div className="flex items-start gap-3 text-left">
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

        <div className="space-y-1">
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
    </DialogHeader>
  );
}

export function AppDialogBody({ className, ...props }: AppDialogSectionProps) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5",
        className,
      )}
      {...props}
    />
  );
}

export function AppDialogFooter({ className, ...props }: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn("shrink-0 border-t px-6 py-4", className)}
      {...props}
    />
  );
}
