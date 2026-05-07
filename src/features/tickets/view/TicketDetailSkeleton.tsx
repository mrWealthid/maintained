"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TicketDetailSkeleton() {
  return (
    <main className="w-full space-y-6 py-8">
      <Skeleton className="h-4 w-24 animate-pulse" />

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 animate-pulse rounded-full" />
          <Skeleton className="h-6 w-20 animate-pulse rounded-full" />
        </div>
        <Skeleton className="h-8 w-2/3 animate-pulse" />
        <Skeleton className="h-4 w-1/3 animate-pulse" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32 animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full animate-pulse" />
              <Skeleton className="h-4 w-5/6 animate-pulse" />
              <Skeleton className="h-4 w-3/4 animate-pulse" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="aspect-[4/3] w-full animate-pulse rounded-lg" />
                <Skeleton className="aspect-[4/3] w-full animate-pulse rounded-lg" />
                <Skeleton className="aspect-[4/3] w-full animate-pulse rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24 animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full animate-pulse" />
              <Skeleton className="h-12 w-full animate-pulse" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20 animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full animate-pulse" />
              <Skeleton className="h-4 w-3/4 animate-pulse" />
              <Skeleton className="h-4 w-2/3 animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
