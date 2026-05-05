import AppHeader from "@/shared/components/header/AppHeader";
import React from "react";

export default React.memo(function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-background">
      <div>
        <AppHeader />
      </div>
      <div className="relative min-h-0 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(circle at center, black 45%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, black 45%, transparent 100%)",
          }}
        />
        <div className="relative flex min-h-full items-center justify-center px-4 py-8 md:px-6 md:py-10">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
});
