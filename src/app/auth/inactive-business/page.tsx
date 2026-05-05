import Link from "next/link";
import { Building2, LifeBuoy, LogIn, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AuthWrapper from "../AuthWrapper";

export default function InactiveBusinessPage() {
  return (
    <AuthWrapper>
      <section className="flex w-full flex-col items-center justify-center gap-4">
        <Card className="w-full max-w-xl border-border/80 bg-card/95">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="size-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Workspace access is currently inactive
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your account is still recognized, but this workspace has been
                deactivated by a platform administrator.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 size-4 shrink-0 text-foreground/70" />
                <p>
                  Existing sessions are blocked immediately while the workspace
                  remains inactive. Contact platform support or your
                  organization owner if this was unexpected.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="sm:flex-1">
                <Link href="/auth/login">
                  <LogIn className="size-4" />
                  Return to login
                </Link>
              </Button>
              <Button asChild variant="outline" className="sm:flex-1">
                <Link href="mailto:support@maintainly.app">
                  <LifeBuoy className="size-4" />
                  Contact support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </AuthWrapper>
  );
}
