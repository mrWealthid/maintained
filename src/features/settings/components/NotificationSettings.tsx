"use client";

import { useEffect, useState } from "react";
import { Bell, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../hooks/settingsHooks";
import { SettingsField } from "./SettingsField";
import { SettingsSection } from "./SettingsSection";
import { SettingsToggleRow } from "./SettingsToggleRow";

const defaultPreferences: NotificationPreferences = {
  ticketCreatedAlerts: true,
  ticketStatusAlerts: true,
  ticketAssignmentAlerts: true,
  technicianRequestAlerts: true,
  tenantMessageAlerts: true,
  commentAlerts: true,
  emailFrequency: "immediate",
  smsPreference: "urgent",
  pushPreference: "important",
};

const NotificationSettings: React.FC = () => {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const [localPreferences, setLocalPreferences] =
    useState<NotificationPreferences>(defaultPreferences);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({ ...defaultPreferences, ...preferences });
    }
  }, [preferences]);

  const patchPreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setLocalPreferences((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    await updatePreferences.mutateAsync(localPreferences);
  };

  return (
    <SettingsSection
      title="Notification Preferences"
      description="Configure how and when you receive notifications"
      icon={Bell}
      actions={
        <Button
          type="button"
          onClick={handleSave}
          disabled={updatePreferences.isPending || isLoading}
        >
          <Save className="mr-2 h-4 w-4" />
          {updatePreferences.isPending ? "Saving..." : "Save Changes"}
        </Button>
      }
    >
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">
          Ticket Notifications
        </h4>

        <div className="space-y-4">
          <SettingsToggleRow
            label="New Ticket Alerts"
            description="Get notified when tenants submit new maintenance requests"
            checked={localPreferences.ticketCreatedAlerts}
            onCheckedChange={(value) =>
              patchPreference("ticketCreatedAlerts", value)
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Status Change Alerts"
            description="Receive alerts when a ticket moves through the workflow"
            checked={localPreferences.ticketStatusAlerts}
            onCheckedChange={(value) =>
              patchPreference("ticketStatusAlerts", value)
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Assignment Alerts"
            description="Notify team members when work is assigned or reassigned"
            checked={localPreferences.ticketAssignmentAlerts}
            onCheckedChange={(value) =>
              patchPreference("ticketAssignmentAlerts", value)
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Technician Request Alerts"
            description="Notify technicians when they are requested for a ticket"
            checked={localPreferences.technicianRequestAlerts}
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
            checked={localPreferences.tenantMessageAlerts}
            onCheckedChange={(value) =>
              patchPreference("tenantMessageAlerts", value)
            }
          />
          <Separator />
          <SettingsToggleRow
            label="Internal Comment Alerts"
            description="Notify relevant team members when ticket comments are added"
            checked={localPreferences.commentAlerts}
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
          <SettingsField label="Email Notifications">
            <Select
              value={localPreferences.emailFrequency}
              onValueChange={(value) =>
                patchPreference(
                  "emailFrequency",
                  value as NotificationPreferences["emailFrequency"]
                )
              }
            >
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

          <SettingsField label="SMS Notifications">
            <Select
              value={localPreferences.smsPreference}
              onValueChange={(value) =>
                patchPreference(
                  "smsPreference",
                  value as NotificationPreferences["smsPreference"]
                )
              }
            >
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

          <SettingsField label="Push Notifications">
            <Select
              value={localPreferences.pushPreference}
              onValueChange={(value) =>
                patchPreference(
                  "pushPreference",
                  value as NotificationPreferences["pushPreference"]
                )
              }
            >
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
        </div>

        <p className="text-sm text-muted-foreground">
          Channel delivery rules apply to the enabled notification groups above.
        </p>
      </div>
    </SettingsSection>
  );
};

export default NotificationSettings;
