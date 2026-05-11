import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Header from "./Header";
import HeaderbarBreadcrumb from "./HeaderbarBreadcrumb";

export const HeaderBar = React.memo(function HeaderBar() {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-2 rounded-t-xl border-b border-border bg-background p-2 shadow-none">
      <SidebarTrigger />
      <Separator
        orientation="vertical"
        className="mx-1 hidden h-4 sm:block"
      />
      <div className="min-w-0 flex-1">
        <HeaderbarBreadcrumb />
      </div>
      <Header />
    </header>
  );
});
