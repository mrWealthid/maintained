import { Skeleton } from "@/components/ui/skeleton";

export const MessageSkeleton = () => (
  <div className="flex space-x-3">
    <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-2 mb-1">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
      </div>
    </div>
  </div>
);
