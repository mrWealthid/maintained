"use client";

import { useState } from "react";
import { Bell, FolderOpen, Globe, Mail, Shield, Ticket, Workflow } from "lucide-react";

import AppPageHeader from "@/shared/components/app-header/AppPageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
} from "@/components/ui/sheet";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SettingsIconBadge,
  SETTINGS_TAB_ICON_BADGE_CLASSNAME,
} from "./SettingsIconBadge";
import { SettingsSection } from "./SettingsSection";
import NotificationSettings from "./NotificationSettings";
import GeneralSettings from "./GeneralSettings";
import EmailSettings from "./EmailSettings";
import SecuritySettings from "./SecuritySettings";
import CategoryManagement from "./CategoryManagement";
import TicketTypeManagement from "./TicketTypeManagement";
import { useAppContext } from "@/shared/contexts/AppContext";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { useCategories, useTicketTypes } from "../hooks/settingsHooks";

type OperationsSheet = "categories" | "ticket-types" | null;

function OperationsConfigCard({
  title,
  description,
  statLabel,
  statValue,
  buttonLabel,
  icon,
  onConfigure,
}: {
  title: string;
  description: string;
  statLabel: string;
  statValue: number | string;
  buttonLabel: string;
  icon: typeof FolderOpen;
  onConfigure: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIconBadge icon={icon} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Configure this setup from a focused side sheet.
          </p>
          <Button type="button" variant="outline" onClick={onConfigure}>
            {buttonLabel}
          </Button>
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">{statLabel}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {statValue}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Active and inactive records are managed in the configuration sheet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function OperationsSettings() {
  const { user } = useAppContext();
  const [openSheet, setOpenSheet] = useState<OperationsSheet>(null);
  const { data: categories = [], isLoading: loadingCategories } =
    useCategories();
  const { data: ticketTypes = [], isLoading: loadingTicketTypes } =
    useTicketTypes();
  const canManageCategories = user.permissions.includes(
    PERMISSION.TICKET_CATEGORIES_MANAGE
  );
  const canManageTicketTypes = user.permissions.includes(
    PERMISSION.TICKET_TYPES_MANAGE
  );

  return (
    <SettingsSection
      title="Operations"
      icon={Workflow}
      description="Configure ticket categories and request type setup across this workspace."
    >
      <div className="space-y-6">
        {canManageCategories ? (
          <OperationsConfigCard
            title="Category Setup"
            description="Manage ticket categories used for intake, triage, and reporting."
            statLabel="Configured categories"
            statValue={loadingCategories ? "..." : categories.length}
            buttonLabel="Configure categories"
            icon={FolderOpen}
            onConfigure={() => setOpenSheet("categories")}
          />
        ) : null}

        {canManageTicketTypes ? (
          <OperationsConfigCard
            title="Ticket Type Setup"
            description="Manage request types that drive ticket workflows and technician routing."
            statLabel="Configured ticket types"
            statValue={loadingTicketTypes ? "..." : ticketTypes.length}
            buttonLabel="Configure ticket types"
            icon={Ticket}
            onConfigure={() => setOpenSheet("ticket-types")}
          />
        ) : null}
      </div>

      <Sheet
        open={openSheet === "categories"}
        onOpenChange={(open) => setOpenSheet(open ? "categories" : null)}
      >
        <AppSheetContent
          side="right"
          className="sm:max-w-2xl"
        >
          <AppSheetHeader
            title="Category Configuration"
            description="Manage ticket categories from a dedicated workspace."
            icon={FolderOpen}
          />
          <AppSheetBody>
            <CategoryManagement />
          </AppSheetBody>
        </AppSheetContent>
      </Sheet>

      <Sheet
        open={openSheet === "ticket-types"}
        onOpenChange={(open) => setOpenSheet(open ? "ticket-types" : null)}
      >
        <AppSheetContent
          side="right"
          className="sm:max-w-2xl"
        >
          <AppSheetHeader
            title="Ticket Type Configuration"
            description="Manage request types from a dedicated workspace."
            icon={Ticket}
          />
          <AppSheetBody>
            <TicketTypeManagement />
          </AppSheetBody>
        </AppSheetContent>
      </Sheet>
    </SettingsSection>
  );
}

const tabs = [
  {
    value: "general",
    label: "General",
    icon: Globe,
    content: GeneralSettings,
  },
  {
    value: "notifications",
    label: "Notifications",
    icon: Bell,
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
    value: "operations",
    label: "Operations",
    icon: Workflow,
    permissions: [
      PERMISSION.TICKET_CATEGORIES_MANAGE,
      PERMISSION.TICKET_TYPES_MANAGE,
    ],
    content: OperationsSettings,
  },
  {
    value: "security",
    label: "Security",
    icon: Shield,
    permission: PERMISSION.SETTINGS_VIEW,
    content: SecuritySettings,
  },
] as const;

const tabTriggerClassName =
  "group h-10 min-w-[120px] flex-none gap-2 rounded-full px-3 data-[state=active]:shadow-none";

const SettingsPage: React.FC = () => {
  const { user } = useAppContext();
  const visibleTabs = tabs.filter((tab) =>
    "permissions" in tab
      ? tab.permissions.some((permission) =>
          user.permissions.includes(permission)
        )
      : !("permission" in tab) || user.permissions.includes(tab.permission)
  );
  const defaultTab = visibleTabs[0]?.value ?? "general";

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
          <TabsList className="h-auto max-w-full w-fit justify-start gap-1 overflow-x-auto rounded-full bg-secondary p-1">
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
