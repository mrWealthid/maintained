import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Header from "./Header";

export const HeaderBar = React.memo(function HeaderBar() {
  return (
    <header className="sticky top-0 z-50 p-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-800   backdrop-blur  ">
      <SidebarTrigger />
      <Header />
    </header>
  );
});
