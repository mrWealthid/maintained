import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = Readonly<{
  title: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  iconWrapClassName?: string;
  actions?: ReactNode;
}>;

export function DashboardSectionHeader({
  title,
  description,
  icon: Icon,
  iconClassName,
  iconWrapClassName,
  actions,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "rounded-xl p-2.5",
            "bg-primary/10 text-primary",
            iconWrapClassName,
          )}
        >
          <Icon className={cn("size-5", iconClassName)} />
        </div>
        <div>
          <div className="text-base font-medium text-card-foreground">{title}</div>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
