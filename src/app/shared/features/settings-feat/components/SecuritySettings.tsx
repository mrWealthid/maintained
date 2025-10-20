"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SecuritySettings as SecuritySettingsType } from "../model/settings.model";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const SecuritySettings: React.FC = () => {
  const [formData, setFormData] = useState<SecuritySettingsType>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    passcode: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (
    field: keyof SecuritySettingsType,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      toast.error("Current password is required");
      return false;
    }
    if (!formData.newPassword) {
      toast.error("New password is required");
      return false;
    }
    if (formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return false;
    }
    if (!formData.passcode) {
      toast.error("Passcode is required for verification");
      return false;
    }
    if (formData.passcode.length !== 6) {
      toast.error("Passcode must be 6 digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          passcode: formData.passcode,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          passcode: "",
        });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to change password");
      }
    } catch (error) {
      toast.error(
        "Failed to change password. Please check your current password and passcode."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password for enhanced security. You&apos;ll need to
            verify with your passcode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) =>
                    handleInputChange("currentPassword", e.target.value)
                  }
                  placeholder="Enter your current password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  placeholder="Enter your new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm your new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="passcode">Verification Passcode</Label>
              <Input
                id="passcode"
                type="text"
                value={formData.passcode}
                onChange={(e) =>
                  handleInputChange(
                    "passcode",
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="Enter 6-digit passcode"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit passcode sent to your registered phone number
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Changing Password..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
