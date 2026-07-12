"use client";

import { useEffect } from "react";
import RouteErrorState from "@/shared/components/error/RouteErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces the full client-visible error; the matching server stack is
    // logged by Next.js against the same `digest` in the server terminal.
    console.error(error);
  }, [error]);

  return (
    <RouteErrorState
      message={error.message}
      digest={error.digest}
      onRetry={reset}
    />
  );
}
