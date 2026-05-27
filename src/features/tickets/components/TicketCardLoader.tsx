import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

const TicketCardLoader = () => (
  <section className="request-card w-full">
    <div className="flex items-center flex-wrap justify-between w-full text-xs mb-2">
      <section className="flex gap-5 items-center">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </section>
      <section>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </section>
    </div>

    <div className="group">
      <Skeleton className="mb-2 mt-3 h-6 w-2/3 rounded" />
      <Skeleton className="mt-2 h-4 w-full rounded" />
      <Skeleton className="mt-1 h-4 w-5/6 rounded" />
      <Skeleton className="mt-1 h-4 w-4/6 rounded" />
    </div>

    <div className="w-full mt-8 flex flex-wrap text-xs justify-between items-center gap-x-4">
      <span className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20 rounded" />
      </span>
      <span className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20 rounded" />
      </span>
      <section className="flex gap-2 items-center text-xs">
        <Skeleton className="h-8 w-8 rounded-full" />
      </section>
    </div>
  </section>
);

export default React.memo(TicketCardLoader);
