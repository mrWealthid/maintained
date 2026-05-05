"use client";

import { Bell, Globe, Mail, Shield, Workflow } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSecuritySection } from "./AppSecuritySection";
import { AppGeneralSection } from "./AppGeneralSection";
import { AppNotificationsSection } from "./AppNotificationsSection";
import { AppOperationsSection } from "./AppOperationsSection";
import AppSettingsEmailFlowWrapper from "./AppSettingsEmailFlowWrapper";

const tabs = [
  {
    value: "general",
    label: "General",
    icon: Globe,
    content: AppGeneralSection,
  },
  {
    value: "notifications",
    label: "Notifications",
    icon: Bell,
    content: AppNotificationsSection,
  },
  {
    value: "email",
    label: "Email",
    icon: Mail,
    content: AppSettingsEmailFlowWrapper,
  },
  {
    value: "operations",
    label: "Operations",
    icon: Workflow,
    content: AppOperationsSection,
  },
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
  defaultTab = "general",
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
