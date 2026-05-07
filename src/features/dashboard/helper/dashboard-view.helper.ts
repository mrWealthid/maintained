export function formatDashboardLocation(
  propertyName?: string,
  unitLabel?: string,
) {
  return [propertyName, unitLabel].filter(Boolean).join(" / ") || "n/a";
}

export function formatDashboardDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatDashboardCurrency(value: number | null) {
  if (value === null) return "n/a";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function truncateDashboardLabel(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

export function labelizeDashboardValue(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function dashboardPercent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}
