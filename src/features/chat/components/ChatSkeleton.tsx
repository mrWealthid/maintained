import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-3 rounded-lg border p-3">
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        ))}
      </aside>

      <section className="flex flex-col rounded-lg border">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="flex-1 space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <Skeleton
                className={`h-12 ${i % 2 === 0 ? "w-2/3" : "w-1/2"} rounded-2xl`}
              />
            </div>
          ))}
        </div>
        <div className="border-t p-3">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </section>
    </div>
  );
}

export default ChatSkeleton;
