/**
 * Static breadcrumb label registry for dashboard routes. Maps a path segment
 * to a human-readable label. Dynamic segments (e.g. `[ticketId]`) fall back
 * to a generic detail label since we don't fetch the underlying entity here.
 *
 * Keep this file in sync with new dashboard pages.
 */
export const DASHBOARD_BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "ticket-management": "Tickets",
  properties: "Properties",
  tenants: "Tenants",
  team: "Team",
  chat: "Chat",
  workspaces: "Workspaces",
  settings: "Settings",
  "access-control": "Access Control",
  apply: "Apply",
  reports: "Reports",
  exports: "Exports",
  verify: "Verify",
};

/**
 * Friendly label used when a path segment doesn't match the static registry.
 * Typically this means a dynamic `[id]` segment — we render a generic
 * "Detail" label rather than the raw id.
 */
export function fallbackBreadcrumbLabel(parentSegment: string | undefined): string {
  const parent = parentSegment
    ? DASHBOARD_BREADCRUMB_LABELS[parentSegment] ?? parentSegment
    : null;
  return parent ? `${parent} detail` : "Detail";
}

export type DashboardBreadcrumb = {
  label: string;
  /** Absolute href the segment links to. Final crumb gets no link. */
  href: string;
  /** True for the last segment in the trail. */
  isCurrent: boolean;
};

/**
 * Build a breadcrumb trail from a pathname like
 * `/dashboard/ticket-management/abc/apply/xyz`. Always includes the leading
 * "Dashboard" crumb. Unknown segments get a fallback label inferred from
 * their parent.
 */
export function buildDashboardBreadcrumbs(pathname: string): DashboardBreadcrumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: DashboardBreadcrumb[] = [];
  let href = "";

  segments.forEach((segment, idx) => {
    href = `${href}/${segment}`;
    const label =
      DASHBOARD_BREADCRUMB_LABELS[segment] ??
      fallbackBreadcrumbLabel(segments[idx - 1]);
    crumbs.push({
      label,
      href,
      isCurrent: idx === segments.length - 1,
    });
  });

  return crumbs;
}
