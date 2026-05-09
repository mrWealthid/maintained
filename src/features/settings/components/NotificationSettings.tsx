"use client";

import { Bell } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NotificationPreferences } from "../models/settings.model";
import type { WorkspaceSettingsFormValues } from "../models/settings-form.model";
import { SettingsField } from "./SettingsField";
import { SettingsSection } from "./SettingsSection";
import { SettingsToggleRow } from "./SettingsToggleRow";

const NotificationSettings: React.FC = () => {
  const { watch, setValue, control } =
    useFormContext<WorkspaceSettingsFormValues>();
  const preferences = watch("notifications");

  const patchPreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setValue(`notifications.${key}`, value as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <SettingsSection
      title="Notification Preferences"
      description="Configure how and when you receive notifications"
      icon={Bell}
    >
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">
          Ticket Notifications
        </h4>

        <div className="space-y-4">
          <SettingsToggleRow
            label="New Ticket Alerts"
            description="Get notified when tenants submit new maintenance requests"
            checked={preferences.ticketCreatedAlerts}
            onCheckedChange={(value) =>
              patchPreference("ticketCreatedAlerts", value)
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Status Change Alerts"
            description="Receive alerts when a ticket moves through the workflow"
            checked={preferences.ticketStatusAlerts}
            onCheckedChange={(value) =>
              patchPreference("ticketStatusAlerts", value)
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Assignment Alerts"
            description="Notify team members when work is assigned or reassigned"
            checked={preferences.ticketAssignmentAlerts}
            onCheckedChange={(value) =>
              patchPreference("ticketAssignmentAlerts", value)
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Technician Request Alerts"
            description="Notify technicians when they are requested for a ticket"
            checked={preferences.technicianRequestAlerts}
            onCheckedChange={(value) =>
              patchPreference("technicianRequestAlerts", value)
            }
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">
          Communication Notifications
        </h4>

        <div className="space-y-4">
          <SettingsToggleRow
            label="Tenant Message Alerts"
            description="Get notified when tenants send updates or replies"
            checked={preferences.tenantMessageAlerts}
            onCheckedChange={(value) =>
              patchPreference("tenantMessageAlerts", value)
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Internal Comment Alerts"
            description="Notify relevant team members when ticket comments are added"
            checked={preferences.commentAlerts}
            onCheckedChange={(value) => patchPreference("commentAlerts", value)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">
          Notification Channels
        </h4>

        <div className="grid gap-4 sm:grid-cols-3">
          <Controller
            control={control}
            name="notifications.emailFrequency"
            render={({ field }) => (
              <SettingsField label="Email Notifications">
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
              </SettingsField>
            )}
          />

          <Controller
            control={control}
            name="notifications.smsPreference"
            render={({ field }) => (
              <SettingsField label="SMS Notifications">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select SMS preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="urgent">Urgent Only</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsField>
            )}
          />

          <Controller
            control={control}
            name="notifications.pushPreference"
            render={({ field }) => (
              <SettingsField label="Push Notifications">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select push preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="important">Important Only</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsField>
            )}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Channel delivery rules apply to the enabled notification groups above.
        </p>
      </div>
    </SettingsSection>
  );
};

export default NotificationSettings;
