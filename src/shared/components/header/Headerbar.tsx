import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Header from "./Header";

export const HeaderBar = React.memo(function HeaderBar() {
  return (
    <header className="sticky top-0 z-50 p-2 flex items-center justify-between border-b border-border bg-background/95 dark:bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80 dark:supports-backdrop-filter:bg-background/90">
      <SidebarTrigger />
      <Header />
    </header>
  );
});
