import React from "react";
import { ThemeToggle } from "@/components/Theme-Toggle";

const Header = () => {
  return (
    <div className="dashboard-header  text-sm  justify-between items-center  flex  gap-3">
      <ThemeToggle />
    </div>
  );
};

export default Header;
