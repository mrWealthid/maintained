import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Header from "./Header";

export const HeaderBar = React.memo(function HeaderBar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-background p-2 shadow-none [border-radius:10px_10px_0px_0px]">
      <SidebarTrigger />
      <Header />
    </header>
  );
});
