"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SecuritySettings as SecuritySettingsType } from "../model/settings.model";
import { useChangePassword } from "../hooks/settingsHooks";
import { Eye, EyeOff } from "lucide-react";

const SecuritySettings: React.FC = () => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const form = useForm<SecuritySettingsType>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      passcode: "",
    },
  });

  const changePassword = useChangePassword();

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const onSubmit = async (data: SecuritySettingsType) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        passcode: data.passcode,
      });

      form.reset();
    } catch (error) {
      // Error is handled by the hook
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                rules={{ required: "Current password is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          placeholder="Enter your current password"
                          {...field}
                        />
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                rules={{
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          placeholder="Enter your new password"
                          {...field}
                        />
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === form.getValues("newPassword") ||
                    "Passwords do not match",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          placeholder="Confirm your new password"
                          {...field}
                        />
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passcode"
                rules={{
                  required: "Passcode is required",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Passcode must be exactly 6 digits",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passcode</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit passcode"
                        maxLength={6}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500 mt-1">
                      Enter the 6-digit passcode sent to your registered phone
                      number
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending
                    ? "Changing Password..."
                    : "Change Password"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
