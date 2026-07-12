import Link from "next/link";

import { requireTradeAccess } from "@/lib/auth/requireTradeAccess";
import TradeProfileForm from "@/features/trades/components/TradeProfileForm";

export const dynamic = "force-dynamic";

export default async function TradeProfilePage() {
  const ctx = await requireTradeAccess({ nextPath: "/trades/profile" });
  const t = ctx.tradesperson;

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">{t.businessName}</p>
            <p className="text-xs text-muted-foreground">Profile</p>
          </div>
          <Link
            href="/trades"
            className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <TradeProfileForm
          initial={{
            businessName: t.businessName ?? "",
            contactPhone: t.contactPhone ?? "",
            description: t.description ?? "",
            specialties: (t.specialties ?? []) as string[],
            address: t.address ?? "",
            serviceAreaKm: t.serviceAreaKm ?? null,
          }}
        />
      </main>
    </div>
  );
}
