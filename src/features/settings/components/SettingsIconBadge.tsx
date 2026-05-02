"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const SETTINGS_TAB_ICON_BADGE_CLASSNAME =
  "bg-background text-foreground ring-1 ring-border/70 shadow-sm group-data-[state=active]:bg-white/18 group-data-[state=active]:text-white group-data-[state=active]:ring-white/30 dark:group-data-[state=active]:bg-black/10 dark:group-data-[state=active]:text-black dark:group-data-[state=active]:ring-black/10";

type SettingsIconBadgeProps = {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md";
};

export function SettingsIconBadge({
  icon: Icon,
  className,
  iconClassName,
  size = "md",
}: SettingsIconBadgeProps) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-xl bg-primary/10 text-primary",
        size === "sm" ? "p-2" : "p-2.5",
        className,
      )}
    >
      <Icon
        className={cn(
          size === "sm" ? "size-4" : "size-5",
          iconClassName,
        )}
      />
    </div>
  );
}
