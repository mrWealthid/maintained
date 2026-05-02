import { ThemeToggle } from "@/components/Theme-Toggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import React from "react";

export default React.memo(function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-h-screen overflow-y-auto bg-muted/40 text-foreground flex flex-col">
      {/* Header */}
      <header className="w-full border-b sticky top-0 border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              ApartmentHub
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full  space-y-6">{children}</div>
      </div>
    </div>
  );
});
