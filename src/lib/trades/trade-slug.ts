import { shortId, slugify } from "@/lib/tickets/ticket-slug";

/**
 * Tradesperson slug builder. Mirrors `buildTicketSlug` so URLs read
 * consistently across the app. The random tail makes accidental collisions
 * extremely unlikely; the API still retries on a duplicate-key error.
 */
export function buildTradeSlug(businessName: string): string {
  const base = slugify(businessName) || "trade";
  return `${base}-${shortId()}`;
}
