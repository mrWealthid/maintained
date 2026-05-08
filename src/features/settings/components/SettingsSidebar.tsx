"use client";

import React, { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="h-full w-64 bg-background border-border">
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="flex h-auto w-full flex-col items-stretch justify-start gap-1 rounded-2xl border border-border/70 bg-secondary p-1 shadow-none">
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="w-full justify-start gap-3 rounded-full px-3 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsSidebar;
