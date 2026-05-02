"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function CenteredPageState({
  children,
  className,
  contentClassName,
}: Props) {
  return (
    <div
      className={cn(
        "flex min-h-[50vh] w-full items-center justify-center px-4 py-6 sm:min-h-[56vh]",
        className,
      )}
    >
      <div className={cn("w-full max-w-2xl", contentClassName)}>{children}</div>
    </div>
  );
}
