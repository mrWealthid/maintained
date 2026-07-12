"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = { token: string };

/**
 * Client island for the trade-invite accept page. Posts the token to the
 * accept endpoint and bounces the trade into their dashboard on success.
 * If the trade isn't logged in, the accept page renders a sign-in hint
 * (the API would return 401, which we surface inline).
 */
export default function AcceptInviteButton({ token }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAccept() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/trades/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.message ?? "Couldn't accept invite");
        return;
      }
      router.push("/trades");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={onAccept} disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Accepting…
          </>
        ) : (
          "Accept invite"
        )}
      </Button>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
