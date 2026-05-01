"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { notificationModes } from "../data/settings.data";
import { NotificationPreferences } from "../models/settings.model";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../hooks/settingsHooks";

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
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Configure how you want to receive notifications about tickets and
            updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="space-y-4">
            <Label className="text-base font-medium">
              Notification Channels
            </Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-toggle">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive text message notifications
                  </p>
                </div>
                <Switch
                  id="sms-toggle"
                  checked={localPreferences.smsEnabled}
                  onCheckedChange={() => handleToggle("smsEnabled")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-toggle">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications
                  </p>
                </div>
                <Switch
                  id="email-toggle"
                  checked={localPreferences.emailEnabled}
                  onCheckedChange={() => handleToggle("emailEnabled")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="phone-toggle">Phone Call Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive phone call notifications
                  </p>
                </div>
                <Switch
                  id="phone-toggle"
                  checked={localPreferences.phoneEnabled}
                  onCheckedChange={() => handleToggle("phoneEnabled")}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updatePreferences.isPending || isLoading}
            >
              {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
