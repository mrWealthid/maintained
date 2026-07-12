"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ErrorList from "@/components/ui/ErrorList";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
  message?: string;
  digest?: string;
  homeHref?: string;
  onRetry: () => void;
};

/**
 * Friendly full-page error UI for App Router error boundaries. Shows a retry
 * button plus the error reference (digest) so a thrown server component
 * degrades gracefully instead of dumping a bare digest string.
 */
export default function RouteErrorState({
  title = "Something went wrong",
  description = "We couldn't finish rendering this page. You can try again or head back.",
  message,
  digest,
  homeHref = "/dashboard",
  onRetry,
}: Props) {
  return (
    <div className="flex min-h-[60vh] items-start justify-center px-4 py-12">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {message ? <ErrorList title={title} error={message} /> : null}

          {digest ? (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Error reference
              </p>
              <p className="mt-1 break-all font-mono text-xs text-foreground">
                {digest}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={onRetry} className="gap-2">
              <RefreshCw className="size-4" />
              Try again
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href={homeHref}>
                <Home className="size-4" />
                Go to dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
