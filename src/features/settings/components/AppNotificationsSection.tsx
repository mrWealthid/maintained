"use client";

import { Bell } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SettingsSection } from "./SettingsSection";
import { SettingsToggleRow } from "./SettingsToggleRow";
import type { AppSettingsFormValues } from "../models/app-settings-form.model";

export function AppNotificationsSection() {
  const { watch, setValue, control } = useFormContext<AppSettingsFormValues>();
  const notifications = watch("settings.notifications");

  return (
    <SettingsSection
      title="Notification Preferences"
      icon={Bell}
      description="Configure platform-level operational notifications for the application"
    >
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">
          Platform Notifications
        </h4>

        <div className="space-y-4">
          <SettingsToggleRow
            label="Business Registration Alerts"
            description="Receive alerts when a new business signs up on the platform"
            checked={notifications.businessRegistrationAlerts}
            onCheckedChange={(value) =>
              setValue(
                "settings.notifications.businessRegistrationAlerts",
                value,
                { shouldDirty: true },
              )
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Team Invite Alerts"
            description="Get notified when internal team invites are created or accepted"
            checked={notifications.teamInviteAlerts}
            onCheckedChange={(value) =>
              setValue("settings.notifications.teamInviteAlerts", value, {
                shouldDirty: true,
              })
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Password Reset Alerts"
            description="Track password reset activity generated from the app auth flow"
            checked={notifications.passwordResetAlerts}
            onCheckedChange={(value) =>
              setValue("settings.notifications.passwordResetAlerts", value, {
                shouldDirty: true,
              })
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Password Change Alerts"
            description="Receive alerts when password change passcodes are issued"
            checked={notifications.passwordChangeAlerts}
            onCheckedChange={(value) =>
              setValue("settings.notifications.passwordChangeAlerts", value, {
                shouldDirty: true,
              })
            }
          />
          <Separator />
          <SettingsToggleRow
            label="App Email Delivery Alerts"
            description="Notify when app-level email delivery starts failing or is disabled"
            checked={notifications.appEmailDeliveryAlerts}
            onCheckedChange={(value) =>
              setValue("settings.notifications.appEmailDeliveryAlerts", value, {
                shouldDirty: true,
              })
            }
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">
          Notification Channels
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="settings.notifications.emailFrequency"
            render={({ field }) => (
              <div className="space-y-3">
                <Label>Email Notifications</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            control={control}
            name="settings.notifications.pushPreference"
            render={({ field }) => (
              <div className="space-y-3">
                <Label>Push Notifications</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="important">Important Only</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        </div>
      </div>
    </SettingsSection>
  );
}
