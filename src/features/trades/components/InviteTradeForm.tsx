"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ErrorList from "@/components/ui/ErrorList";

/**
 * Admin-side invite form on `/dashboard/trades`. Posts to
 * `/api/workspaces/me/trades`. The trade must already exist in the system
 * (signed up at /auth/signup?kind=trade) — the API 404s with a hint if it doesn't.
 */
export default function InviteTradeForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessEmail(null);
    setPending(true);
    try {
      const res = await fetch("/api/workspaces/me/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body);
        return;
      }
      setSuccessEmail(email.trim().toLowerCase());
      setEmail("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invite a tradesperson</CardTitle>
        <CardDescription>
          Enter the email they signed up with at{" "}
          <code>/auth/signup?kind=trade</code>. They&apos;ll get an email +
          a link to accept.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          {error ? (
            <ErrorList title="Couldn't send invite" error={error as never} />
          ) : null}
          {successEmail ? (
            <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              Invite sent to {successEmail}.
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="trade-email">Trade account email</Label>
              <Input
                id="trade-email"
                type="email"
                required
                placeholder="trade@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={pending || !email.trim()}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Send invite
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
