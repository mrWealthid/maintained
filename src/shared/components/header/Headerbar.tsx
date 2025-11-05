import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Header from "./Header";

export const HeaderBar = React.memo(function HeaderBar() {
  return (
    <header className="sticky top-0 z-50 p-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-950/90">
      <SidebarTrigger />
      <Header />
    </header>
  );
});
