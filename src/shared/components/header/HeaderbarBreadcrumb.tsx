"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buildDashboardBreadcrumbs } from "@/shared/routes/dashboard-breadcrumbs";

export default function HeaderbarBreadcrumb() {
  const pathname = usePathname();
  const crumbs = buildDashboardBreadcrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1 text-sm"
    >
      <ol className="flex min-w-0 items-center gap-1">
        {crumbs.map((crumb, idx) => (
          <li
            key={crumb.href}
            className="flex min-w-0 items-center gap-1"
          >
            {idx > 0 ? (
              <ChevronRight
                className="size-3.5 shrink-0 text-muted-foreground/60"
                aria-hidden="true"
              />
            ) : null}
            {crumb.isCurrent ? (
              <span
                aria-current="page"
                className="truncate font-medium text-foreground"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className={cn(
                  "truncate text-muted-foreground hover:text-foreground",
                  // Hide intermediate crumbs on very narrow screens; the
                  // current page label always stays visible.
                  idx > 0 && idx < crumbs.length - 1 && "hidden sm:inline",
                )}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
