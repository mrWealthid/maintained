import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SuccessScreen({
  seconds = 6,
  to = "/admin/dashboard",
  onCloseModal,
}: {
  seconds?: number;
  to?: string;
  onCloseModal?: () => void;
}) {
  const router = useRouter();
  const [count, setCount] = useState(seconds);

  // Keep refs so we can safely clear/cancel
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectedRef = useRef(false);

  // Start countdown once
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCount((c) => Math.max(0, c - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Redirect when countdown hits 0 (AFTER render)
  useEffect(() => {
    if (count === 0 && !redirectedRef.current) {
      redirectedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      // Defer to the microtask queue to be extra safe
      Promise.resolve().then(() => router.push(to));
    }
  }, [count, router, to]);

  const goNow = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    redirectedRef.current = true;
    router.push(to);
  };

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Sparkles className="h-7 w-7" />
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">All set! 🎉</h2>
      <p className="text-sm text-muted-foreground">
        Redirecting to your dashboard in{" "}
        <span className="font-semibold">{count}s</span>.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={goNow} className="gap-2">
          Go now <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" onClick={onCloseModal}>
          Close
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        If you’re not redirected,{" "}
        <button
          className="underline underline-offset-4 hover:text-foreground"
          onClick={goNow}
        >
          click here
        </button>
        .
      </p>
    </div>
  );
}
