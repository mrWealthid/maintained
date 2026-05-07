"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ErrorList from "@/components/ui/ErrorList";
import { ApiErrorHandler } from "@/utils/apiError";

type Props = {
  error: unknown;
  onRetry: () => void;
};

export default function TicketDetailErrorState({ error, onRetry }: Props) {
  return (
    <main className="min-h-[70vh] bg-background p-4 md:p-8">
      <div className="mx-auto flex max-w-2xl items-center justify-center py-10">
        <Card className="w-full border-border/80 shadow-sm">
          <CardContent className="flex flex-col gap-5 px-6 py-10 text-center md:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Unable to load ticket
              </h1>
              <p className="text-sm text-muted-foreground">
                Something went wrong while loading this ticket. You can retry or go back to the ticket list.
              </p>
            </div>
            <ErrorList error={ApiErrorHandler.extract(error)} />
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/dashboard/ticket-management">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to tickets
                </Link>
              </Button>
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
