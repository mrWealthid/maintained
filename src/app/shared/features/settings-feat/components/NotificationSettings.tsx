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
import { NotificationPreferences } from "../model/settings.model";
import { toast } from "sonner";

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    mode: "SMS",
    smsEnabled: true,
    emailEnabled: false,
    phoneEnabled: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user preferences from API
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/user/notification-preferences");
      const data = await response.json();
      if (data.status === "success") {
        setPreferences(data.data);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success("Notification preferences updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update preferences");
      }
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: "SMS" | "EMAIL" | "PHONE") => {
    setPreferences((prev) => ({
      ...prev,
      mode,
      smsEnabled: mode === "SMS",
      emailEnabled: mode === "EMAIL",
      phoneEnabled: mode === "PHONE",
    }));
  };

  const handleToggle = (type: keyof Omit<NotificationPreferences, "mode">) => {
    setPreferences((prev) => ({
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
              value={preferences.mode}
              onValueChange={handleModeChange}
              className="mt-3"
            >
              {notificationModes.map((mode) => (
                <div key={mode.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={mode.value} id={mode.value} />
                  <Label htmlFor={mode.value} className="flex-1">
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-sm text-gray-500">
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
                  <p className="text-sm text-gray-500">
                    Receive text message notifications
                  </p>
                </div>
                <Switch
                  id="sms-toggle"
                  checked={preferences.smsEnabled}
                  onCheckedChange={() => handleToggle("smsEnabled")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-toggle">Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive email notifications
                  </p>
                </div>
                <Switch
                  id="email-toggle"
                  checked={preferences.emailEnabled}
                  onCheckedChange={() => handleToggle("emailEnabled")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="phone-toggle">Phone Call Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive phone call notifications
                  </p>
                </div>
                <Switch
                  id="phone-toggle"
                  checked={preferences.phoneEnabled}
                  onCheckedChange={() => handleToggle("phoneEnabled")}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
