import Link from "next/link";

import { cn } from "@/lib/utils";

interface MaintainLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "full" | "icon" | "wordmark";
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

function LogoIcon({ iconSize }: { iconSize: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-md bg-primary text-primary-foreground font-semibold"
      style={{ width: iconSize, height: iconSize }}
    >
      M
    </span>
  );
}

function LogoContent({
  className,
  size = "md",
  variant = "full",
}: Pick<MaintainLogoProps, "className" | "size" | "variant">) {
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
        <LogoIcon iconSize={currentSize.icon} />
      ) : null}
      {variant !== "icon" ? (
        <span className={cn("tracking-normal", currentSize.text)}>
          Maintain
        </span>
      ) : null}
    </span>
  );
}

function MaintainLogo({
  linkHref = "/dashboard",
  disableLink = false,
  ...props
}: MaintainLogoProps) {
  const content = <LogoContent {...props} />;

  if (disableLink) {
    return content;
  }

  return (
    <Link href={linkHref} aria-label="Maintain home">
      {content}
    </Link>
  );
}

export { MaintainLogo };
