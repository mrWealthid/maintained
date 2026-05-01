import { Skeleton } from "@/components/ui/skeleton";

/**
 * Suspense fallback for ticket list pages (admin / technician / users).
 * Renders header + filter row + 8 row placeholders.
 */
export function TicketListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="border-b px-4 py-3 grid grid-cols-12 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 col-span-2" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="border-b last:border-b-0 px-4 py-4 grid grid-cols-12 gap-3 items-center"
          >
            <Skeleton className="h-4 col-span-2" />
            <Skeleton className="h-4 col-span-3" />
            <Skeleton className="h-5 col-span-2 rounded-full" />
            <Skeleton className="h-5 col-span-2 rounded-full" />
            <Skeleton className="h-4 col-span-2" />
            <Skeleton className="h-8 col-span-1 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TicketListSkeleton;
