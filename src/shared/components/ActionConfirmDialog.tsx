"use client";

import type { ComponentType, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";

type ActionConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  headerDescription?: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  variant?: "default" | "destructive";
  icon?: ComponentType<{ className?: string }>;
  children?: ReactNode;
};

export default function ActionConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  headerDescription,
  confirmLabel,
  onConfirm,
  isLoading = false,
  variant = "default",
  icon: Icon = AlertTriangle,
  children,
}: ActionConfirmDialogProps) {
  const resolvedHeaderDescription =
    headerDescription ??
      variant === "destructive"
      ? "Review this action carefully before you continue."
      : "Review the details below and confirm to continue.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppDialogContent className="sm:max-w-lg">
        <AppDialogHeader
          title={title}
          description={resolvedHeaderDescription}
          icon={Icon}
          tone={variant}
        />

        <AppDialogBody>
          <div className="rounded-md p-5 text-center">
            <div
              className={`mx-auto mb-4 flex size-12 items-center justify-center rounded-full ${variant === "destructive"
                ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300"
                : "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                }`}
            >
              <Icon className="size-6" />
            </div>
            <p className="text-sm leading-6 text-foreground/80">{description}</p>
          </div>
          {children ? <div className="space-y-4">{children}</div> : null}
        </AppDialogBody>

        <AppDialogFooter>
          <Button variant="outline" disabled={isLoading} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={variant} disabled={isLoading} onClick={() => void onConfirm()}>
            {confirmLabel}
          </Button>
        </AppDialogFooter>
      </AppDialogContent>
    </Dialog>
  );
}
