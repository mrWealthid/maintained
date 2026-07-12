import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireTradeAccess } from "@/lib/auth/requireTradeAccess";
import { TECHNICIAN_SPECIALTY_LABELS } from "@/features/technicians/models/technician-specialty.model";

// Always rerun on each request so the trade always sees their live profile.
export const dynamic = "force-dynamic";

/**
 * Trade dashboard overview. Phase 1 deliberately ships as a single-page shell;
 * /trades/requests, /trades/quotes, /trades/chat etc. land in subsequent phases.
 * Auth gating happens inline (no layout-level gate) so /trades/signup stays
 * public without a nested route-group workaround.
 */
export default async function TradesOverviewPage() {
  const ctx = await requireTradeAccess({ nextPath: "/trades" });
  const specialties = ctx.tradesperson.specialties ?? [];

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">
              {ctx.tradesperson.businessName}
            </p>
            <p className="text-xs text-muted-foreground">{ctx.email}</p>
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Tradesperson
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome, {ctx.name.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Your trade dashboard. Repair requests, quotes, and conversations
            from workspaces you&apos;ve been added to will appear here.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>
                {ctx.tradesperson.businessName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="text-muted-foreground">Specialties</div>
              {specialties.length ? (
                <ul className="flex flex-wrap gap-1.5">
                  {specialties.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs"
                    >
                      {TECHNICIAN_SPECIALTY_LABELS[s] ?? s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No specialties set yet. Add them to start receiving broadcast
                  requests.
                </p>
              )}
              <div className="pt-2">
                <Link
                  href="/trades/profile"
                  className="text-xs font-medium text-foreground underline-offset-2 hover:underline"
                >
                  Edit profile →
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Incoming requests</CardTitle>
              <CardDescription>Phase 2 — coming soon</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Workspaces will be able to broadcast repair requests to your
              specialty or invite you directly. You&apos;ll see them here.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quotes &amp; jobs</CardTitle>
              <CardDescription>Phase 3 — coming soon</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Submit quotes against repair requests; accepted quotes become
              jobs you can chat about and complete.
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm">
          <p className="font-medium">Phase 1 of 4</p>
          <p className="text-muted-foreground">
            Identity is live. Workspace linking, broadcast requests, quotes,
            and chat ship in subsequent phases —{" "}
            <Link href="/" className="underline-offset-2 hover:underline">
              see TRADESPEOPLE_REWORK.md
            </Link>{" "}
            for the plan.
          </p>
        </div>
      </main>
    </div>
  );
}
