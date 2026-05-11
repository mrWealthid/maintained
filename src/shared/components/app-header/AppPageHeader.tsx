import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type AppPageHeaderProps = {
  /** Canonical page title. */
  title?: string;
  /** Legacy alias for `title` — retained so existing callers keep working. */
  name?: string;
  /** Optional one-line description rendered under the title. */
  description?: string;
  /** When present, renders a subtle "Back" link above the title. */
  backHref?: string;
  /** Label for the back button. Defaults to "Back". */
  backLabel?: string;
  /** Trailing action slot (buttons, dialogs, etc) shown right-aligned on wider screens. */
  actions?: React.ReactNode;
  /**
   * `page` adds a thin bottom rule to separate the header from the page
   * content. `bare` strips the rule for embedded use inside another card.
   */
  variant?: "page" | "bare";
  className?: string;
};

export default function AppPageHeader({
  title,
  name,
  description,
  backHref,
  backLabel = "Back",
  actions,
  variant = "page",
  className,
}: AppPageHeaderProps) {
  const heading = title ?? name ?? "";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        variant === "page" && "border-b border-border/60 pb-3",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="font-display text-base font-semibold leading-tight tracking-tight text-foreground sm:text-lg">
          {heading}
        </h1>
        {description ? (
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
