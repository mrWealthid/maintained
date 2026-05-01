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
    <div className="w-64 bg-background  border-gray-200 dark:border-gray-700 h-full">
      <div className="p-6">
        {/* <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
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
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
