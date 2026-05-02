"use client";

import { Bell, FolderOpen, Mail, Shield } from "lucide-react";

import AppPageHeader from "@/shared/components/app-header/AppPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SettingsIconBadge,
  SETTINGS_TAB_ICON_BADGE_CLASSNAME,
} from "./SettingsIconBadge";
import NotificationSettings from "./NotificationSettings";
import EmailSettings from "./EmailSettings";
import SecuritySettings from "./SecuritySettings";
import CategoryManagement from "./CategoryManagement";
import TicketTypeManagement from "./TicketTypeManagement";
import { useAppContext } from "@/shared/contexts/AppContext";
import { PERMISSION } from "@/shared/auth/permission-registry";

function OperationsSettings() {
  const { user } = useAppContext();
  const canManageCategories = user.permissions.includes(
    PERMISSION.TICKET_CATEGORIES_MANAGE
  );
  const canManageTicketTypes = user.permissions.includes(
    PERMISSION.TICKET_TYPES_MANAGE
  );

  return (
    <div className="space-y-6">
      {canManageCategories ? <CategoryManagement /> : null}
      {canManageTicketTypes ? <TicketTypeManagement /> : null}
    </div>
  );
}

const tabs = [
  {
    value: "notifications",
    label: "Notifications",
    icon: Bell,
    permission: PERMISSION.SETTINGS_VIEW,
    content: NotificationSettings,
  },
  {
    value: "email",
    label: "Email",
    icon: Mail,
    permission: PERMISSION.SETTINGS_EMAIL_MANAGE,
    content: EmailSettings,
  },
  {
    value: "security",
    label: "Security",
    icon: Shield,
    permission: PERMISSION.SETTINGS_VIEW,
    content: SecuritySettings,
  },
  {
    value: "operations",
    label: "Operations",
    icon: FolderOpen,
    permissions: [
      PERMISSION.TICKET_CATEGORIES_MANAGE,
      PERMISSION.TICKET_TYPES_MANAGE,
    ],
    content: OperationsSettings,
  },
] as const;

const tabTriggerClassName =
  "group h-10 min-w-[120px] flex-none gap-2 rounded-lg px-3 data-[state=active]:shadow-md";

const SettingsPage: React.FC = () => {
  const { user } = useAppContext();
  const visibleTabs = tabs.filter((tab) =>
    "permissions" in tab
      ? tab.permissions.some((permission) =>
          user.permissions.includes(permission)
        )
      : user.permissions.includes(tab.permission)
  );
  const defaultTab = visibleTabs[0]?.value ?? "notifications";

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col gap-2">
        <AppPageHeader name="Settings" />
        <p className="text-sm text-muted-foreground">
          Manage workspace preferences, notifications, email, and security.
        </p>
      </div>

      {visibleTabs.length ? (
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="h-auto max-w-full w-fit justify-start gap-1 overflow-x-auto rounded-xl p-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={tabTriggerClassName}
                >
                  <SettingsIconBadge
                    icon={Icon}
                    size="sm"
                    className={SETTINGS_TAB_ICON_BADGE_CLASSNAME}
                  />
                  <span className="text-xs sm:text-sm">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {visibleTabs.map((tab) => {
            const Content = tab.content;
            return (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="space-y-6"
              >
                <Content />
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <p className="text-sm text-muted-foreground">
          You do not have access to any settings sections in this workspace.
        </p>
      )}
    </div>
  );
};

export default SettingsPage;
