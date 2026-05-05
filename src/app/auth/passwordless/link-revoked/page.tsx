import Link from "next/link";
import { LogIn, ShieldCheck, ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthWrapper from "@/app/auth/AuthWrapper";

export default async function PasswordlessLinkRevokedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const isInvalid = params.status === "invalid";

  return (
    <AuthWrapper>
      <section className="flex w-full flex-col items-center justify-center gap-4">
        <Card className="w-full max-w-xl border-border/80 bg-card/95">
          <CardHeader className="space-y-4 text-center">
            <div
              className={`mx-auto flex size-12 items-center justify-center rounded-2xl ${
                isInvalid
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isInvalid ? (
                <ShieldX className="size-6" />
              ) : (
                <ShieldCheck className="size-6" />
              )}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-foreground">
                {isInvalid
                  ? "This passwordless link is no longer available"
                  : "Passwordless link revoked"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isInvalid
                  ? "The sign-in link was already invalid, expired, or previously revoked."
                  : "The sign-in link has been invalidated and any active sessions for this account were signed out."}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              {isInvalid
                ? "If you still need access, go back to login and request a fresh passwordless sign-in link."
                : "If you still need to sign in, return to login and request a new passwordless link from a trusted device."}
            </div>

            <Button asChild className="w-full">
              <Link href="/auth/login">
                <LogIn className="size-4" />
                Return to login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </AuthWrapper>
  );
}
