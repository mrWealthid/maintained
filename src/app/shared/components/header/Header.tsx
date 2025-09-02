import React from "react";
import SwitchToggle from "../switch/SwitchToggle";
import { ThemeToggle } from "@/components/Theme-Toggle";

const Header = async () => {
  return (
    <div className="dashboard-header  text-sm  justify-between items-center  flex  gap-3">
      {/* <Profile /> */}
      <ThemeToggle />
      {/* <SwitchToggle /> */}
      {/* <Link href={'/dashboard/account'}>Account</Link> */}
      {/* <Logout /> */}
    </div>
  );
};

export default Header;
