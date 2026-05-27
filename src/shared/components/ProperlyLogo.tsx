import Link from "next/link";

import { cn } from "@/lib/utils";

interface ProperlyLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "full" | "icon" | "wordmark";
  /** Show the mark inside a filled rounded tile (uses theme primary tokens). */
  badged?: boolean;
  linkHref?: string;
  disableLink?: boolean;
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg", gap: "gap-1.5" },
  md: { icon: 32, text: "text-xl", gap: "gap-2" },
  lg: { icon: 48, text: "text-3xl", gap: "gap-3" },
  xl: { icon: 64, text: "text-4xl", gap: "gap-4" },
  "2xl": { icon: 80, text: "text-5xl", gap: "gap-5" },
} as const;

/**
 * Monochrome logo mark drawn with `currentColor`, so it inherits whatever
 * text color is in scope — adapting automatically to the active theme,
 * light/dark mode, and any background it sits on.
 */
function LogoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M6 14.5 16 6l10 8.5"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 13v11.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V13"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19.2l2.8 2.8L20 16.4"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoIcon({ iconSize, badged }: { iconSize: number; badged?: boolean }) {
  if (!badged) {
    return <LogoMark size={iconSize} />;
  }

  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"
      style={{ width: iconSize, height: iconSize }}
    >
      <LogoMark size={Math.round(iconSize * 0.72)} />
    </span>
  );
}

function LogoContent({
  className,
  size = "md",
  variant = "full",
  badged = false,
}: Pick<ProperlyLogoProps, "className" | "size" | "variant" | "badged">) {
  const currentSize = sizeMap[size ?? "md"];

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold text-primary",
        currentSize.gap,
        className
      )}
    >
      {variant !== "wordmark" ? (
        <LogoIcon iconSize={currentSize.icon} badged={badged} />
      ) : null}
      {variant !== "icon" ? (
        <span className={cn("tracking-tight", currentSize.text)}>
          Properly
        </span>
      ) : null}
    </span>
  );
}

function ProperlyLogo({
  linkHref = "/dashboard",
  disableLink = false,
  ...props
}: ProperlyLogoProps) {
  const content = <LogoContent {...props} />;

  if (disableLink) {
    return content;
  }

  return (
    <Link href={linkHref} aria-label="Properly home">
      {content}
    </Link>
  );
}

export { ProperlyLogo };
