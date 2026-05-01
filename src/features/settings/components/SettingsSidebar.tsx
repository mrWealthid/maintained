"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { settingsTabs } from "../data/settings.data";
import { useAppContext } from "@/shared/contexts/AppContext";

interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { user } = useAppContext();

  const filteredTabs = useMemo(() => {
    return settingsTabs.filter(
      (tab) => !tab.permission || user.permissions.includes(tab.permission)
    );
  }, [user.permissions]);

  return (
    <div className="w-64 bg-background  border-border h-full">
      <div className="p-6">
        {/* <h2 className="text-lg font-semibold text-foreground mb-6">
          Settings
        </h2> */}
        <nav className="space-y-2">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                    : "text-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
                )}
              >
                {/* {React.createElement(Icon, {
                            className: "text-xl w-5 h-5",
                          })} */}
                <Icon className="mr-3 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SettingsSidebar;
