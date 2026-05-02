"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { notificationModes } from "../data/settings.data";
import { NotificationPreferences } from "../models/settings.model";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../hooks/settingsHooks";
import { SettingsSection } from "./SettingsSection";
import { SettingsToggleRow } from "./SettingsToggleRow";

const NotificationSettings: React.FC = () => {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const [localPreferences, setLocalPreferences] =
    useState<NotificationPreferences>({
      mode: "SMS",
      smsEnabled: true,
      emailEnabled: false,
      phoneEnabled: false,
    });

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    await updatePreferences.mutateAsync(localPreferences);
  };

  const handleModeChange = (mode: "SMS" | "EMAIL" | "PHONE") => {
    setLocalPreferences((prev) => ({
      ...prev,
      mode,
      smsEnabled: mode === "SMS",
      emailEnabled: mode === "EMAIL",
      phoneEnabled: mode === "PHONE",
    }));
  };

  const handleToggle = (type: keyof Omit<NotificationPreferences, "mode">) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Notification Preferences"
        description="Configure how you receive ticket and workspace updates"
        icon={Bell}
        actions={
          <Button
            onClick={handleSave}
            disabled={updatePreferences.isPending || isLoading}
          >
            {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        }
      >
          <div>
            <Label className="text-base font-medium">
              Preferred Notification Method
            </Label>
            <RadioGroup
              value={localPreferences.mode}
              onValueChange={handleModeChange}
              className="mt-3"
            >
              {notificationModes.map((mode) => (
                <div key={mode.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={mode.value} id={mode.value} />
                  <Label htmlFor={mode.value} className="flex-1">
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {mode.description}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-medium">
              Notification Channels
            </Label>
            <div className="space-y-3">
              <SettingsToggleRow
                label="SMS Notifications"
                description="Receive text message notifications"
                checked={localPreferences.smsEnabled}
                onCheckedChange={() => handleToggle("smsEnabled")}
              />
              <SettingsToggleRow
                label="Email Notifications"
                description="Receive email notifications"
                checked={localPreferences.emailEnabled}
                onCheckedChange={() => handleToggle("emailEnabled")}
              />
              <SettingsToggleRow
                label="Phone Call Notifications"
                description="Receive phone call notifications"
                checked={localPreferences.phoneEnabled}
                onCheckedChange={() => handleToggle("phoneEnabled")}
              />
            </div>
          </div>
      </SettingsSection>
    </div>
  );
};

export default NotificationSettings;
