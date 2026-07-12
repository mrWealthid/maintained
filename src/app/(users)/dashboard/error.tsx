"use client";

import { useEffect } from "react";
import RouteErrorState from "@/shared/components/error/RouteErrorState";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteErrorState
      title="This page hit a problem"
      description="The dashboard couldn't load this section. Try again, or return to the overview."
      message={error.message}
      digest={error.digest}
      onRetry={reset}
    />
  );
}
