"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, HardHat } from "lucide-react";

export type SignupKind = "manager" | "trade";

/**
 * Top-level switcher that flips `/auth/signup` between the workspace
 * manager flow and the external tradesperson flow. State lives in the
 * URL (`?kind=trade`) so refreshes, deep-links and browser-back behave
 * predictably — same pattern as eventSphere's organizer/vendor toggle.
 */
export function SignupKindToggle({ kind }: { kind: SignupKind }) {
  const router = useRouter();
  const search = useSearchParams();

  function setKind(next: SignupKind) {
    if (next === kind) return;
    const params = new URLSearchParams(search.toString());
    if (next === "trade") params.set("kind", "trade");
    else params.delete("kind");
    const qs = params.toString();
    router.replace(qs ? `/auth/signup?${qs}` : "/auth/signup", {
      scroll: false,
    });
  }

  return (
    <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setKind("manager")}
        className={
          kind === "manager"
            ? "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            : "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        }
      >
        <Briefcase className="size-4" />
        Manage properties
      </button>
      <button
        type="button"
        onClick={() => setKind("trade")}
        className={
          kind === "trade"
            ? "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            : "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        }
      >
        <HardHat className="size-4" />
        Offer trades
      </button>
    </div>
  );
}
