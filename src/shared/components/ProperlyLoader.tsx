import { cn } from "@/lib/utils";

interface ProperlyLoaderProps {
  /** Cover the viewport (root route loader). Otherwise centers within the content area. */
  fullscreen?: boolean;
  /** Optional caption shown under the mark. */
  label?: string;
  className?: string;
}

/**
 * Brand route loader. The Properly mark (house + check) draws itself on a
 * continuous loop — roof, walls, then the check — signalling work in progress.
 * Pure CSS (see `.properly-loader` in global.css), so it stays a server
 * component and respects `prefers-reduced-motion`. Uses `currentColor`, so it
 * inherits the theme and adapts to light/dark automatically.
 */
export function ProperlyLoader({
  fullscreen = false,
  label,
  className,
}: ProperlyLoaderProps) {
  return (
    <div
      className={cn(
        "grid place-items-center text-primary",
        fullscreen ? "fixed inset-0 z-50 bg-background" : "min-h-[60vh] w-full",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      <div className="flex flex-col items-center gap-4">
        <svg
          className="properly-loader"
          width={72}
          height={72}
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <path
            pathLength={100}
            d="M6 14.5 16 6l10 8.5"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            pathLength={100}
            d="M8 13v11.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V13"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            pathLength={100}
            d="M12 19.2l2.8 2.8L20 16.4"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {label ? (
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
