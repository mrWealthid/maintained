"use client";

import { Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSecuritySection } from "./AppSecuritySection";

const tabs = [
  {
    value: "security",
    label: "Security",
    icon: Shield,
    content: AppSecuritySection,
  },
] as const;

const tabTriggerClassName =
  "group h-10 min-w-[120px] flex-none gap-2 rounded-lg px-3 data-[state=active]:shadow-md";

export type AppSettingsTabValue = (typeof tabs)[number]["value"];

export function AppSettingsTabs({
  defaultTab = "security",
}: {
  defaultTab?: AppSettingsTabValue;
}) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="bg-muted/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={tabTriggerClassName}
            >
              <Icon className="size-4" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tabs.map((tab) => {
        const Content = tab.content;
        return (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            <Content />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
