"use client";

import { ClipboardList, Timer, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SettingsIconBadge } from "./SettingsIconBadge";
import { SettingsSection } from "./SettingsSection";
import AppCategoryManagement from "./AppCategoryManagement";

function ComingSoonCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="opacity-70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIconBadge icon={icon} />
          {title}
          <span className="ml-2 rounded-full border border-border/70 bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Coming soon
          </span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          Configuration for this area will be available in a future release.
        </p>
      </CardContent>
    </Card>
  );
}

export function AppOperationsSection() {
  return (
    <SettingsSection
      title="Operations"
      icon={Workflow}
      description="Platform-wide operational defaults for tickets, technicians, and SLAs."
    >
      <div className="space-y-6">
        <AppCategoryManagement />

        <ComingSoonCard
          title="SLA & Response Times"
          description="Default response and resolution targets per ticket priority across all workspaces."
          icon={Timer}
        />

        <ComingSoonCard
          title="Technician Assignment"
          description="Auto-assignment rules and load-balancing defaults for technician routing."
          icon={ClipboardList}
        />
      </div>
    </SettingsSection>
  );
}
