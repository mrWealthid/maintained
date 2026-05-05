"use client";

import { Globe, Webhook } from "lucide-react";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TIME_ZONE_OPTIONS } from "@/lib/date/timezone-options";
import { SettingsField } from "./SettingsField";
import { SettingsSection } from "./SettingsSection";
import type { AppSettingsFormValues } from "../models/app-settings-form.model";

type IntegrationKey = "googleCalendar" | "slack" | "mailchimp" | "zapier";

export function AppGeneralSection() {
  const { watch, setValue, control } = useFormContext<AppSettingsFormValues>();
  const general = watch("settings.general");

  const integrations = useMemo(
    () => [
      {
        key: "googleCalendar" as IntegrationKey,
        name: "Google Calendar",
        description: "Enable default calendar integration across the platform",
      },
      {
        key: "slack" as IntegrationKey,
        name: "Slack",
        description: "Allow workspace alerts and operational notifications",
      },
      {
        key: "mailchimp" as IntegrationKey,
        name: "Mailchimp",
        description: "Permit sync to mailing audiences from app workflows",
      },
      {
        key: "zapier" as IntegrationKey,
        name: "Zapier",
        description: "Expose app events to automation workflows",
      },
    ],
    [],
  );

  return (
    <SettingsSection
      title="General Settings"
      icon={Globe}
      description="Platform-wide localization defaults and third-party integrations"
    >
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Localization</h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="settings.general.timezone"
            render={({ field }) => (
              <SettingsField label="Timezone">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_ZONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingsField>
            )}
          />

          <Controller
            control={control}
            name="settings.general.dateFormat"
            render={({ field }) => (
              <SettingsField label="Date Format">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsField>
            )}
          />

          <Controller
            control={control}
            name="settings.general.timeFormat"
            render={({ field }) => (
              <SettingsField label="Time Format">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsField>
            )}
          />

          <Controller
            control={control}
            name="settings.general.language"
            render={({ field }) => (
              <SettingsField label="Language">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsField>
            )}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Integrations</h4>
          <Webhook className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.key}
              className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/35 p-4"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {integration.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>
              <Switch
                checked={general.integrations[integration.key].connected}
                onCheckedChange={(checked) =>
                  setValue(
                    `settings.general.integrations.${integration.key}.connected`,
                    checked,
                    { shouldDirty: true },
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
    </SettingsSection>
  );
}
