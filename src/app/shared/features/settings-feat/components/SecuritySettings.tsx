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
import {
  useInitiatePasswordChange,
  useVerifyPasscodeAndChangePassword,
} from "../hooks/settingsHooks";
import { Eye, EyeOff } from "lucide-react";

const SecuritySettings: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [storedNewPassword, setStoredNewPassword] = useState("");
  const [passcode, setPasscode] = useState("");

  const initiatePasswordChange = useInitiatePasswordChange();
  const verifyPasscode = useVerifyPasscodeAndChangePassword();

  const form = useForm<SecuritySettingsType>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      passcode: "",
    },
  });

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const onStep1Submit = async (data: SecuritySettingsType) => {
    try {
      await initiatePasswordChange.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setStoredNewPassword(data.newPassword);
      setStep(2);
      // Clear current and confirm password fields but keep new password stored
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const onStep2Submit = async () => {
    if (!passcode || passcode.length !== 6) {
      return;
    }

    try {
      await verifyPasscode.mutateAsync({
        passcode,
        newPassword: storedNewPassword,
      });

      // Reset everything
      form.reset();
      setPasscode("");
      setStoredNewPassword("");
      setStep(1);
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
            {step === 1
              ? "Update your password for enhanced security. You&apos;ll need to verify with a passcode sent to your email."
              : "Enter the verification passcode sent to your email to complete the password change."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onStep1Submit)}
                className="space-y-4"
              >
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

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={initiatePasswordChange.isPending}
                  >
                    {initiatePasswordChange.isPending
                      ? "Sending Passcode..."
                      : "Continue"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  A verification passcode has been sent to your email. Please
                  check your inbox and enter the 6-digit code below.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Verification Passcode
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit passcode"
                    maxLength={6}
                    value={passcode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setPasscode(value);
                    }}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the 6-digit passcode sent to your registered email
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      setPasscode("");
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={onStep2Submit}
                    disabled={verifyPasscode.isPending || passcode.length !== 6}
                  >
                    {verifyPasscode.isPending
                      ? "Changing Password..."
                      : "Change Password"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
