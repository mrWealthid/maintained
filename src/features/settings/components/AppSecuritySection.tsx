"use client";

import { Shield } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { SettingsSection } from "./SettingsSection";
import { SettingsToggleRow } from "./SettingsToggleRow";
import { SettingsField } from "./SettingsField";
import type { AppSettingsFormValues } from "../models/app-settings-form.model";

export function AppSecuritySection() {
  const { control, register } = useFormContext<AppSettingsFormValues>();

  return (
    <SettingsSection
      title="Platform Security"
      icon={Shield}
      description="Authentication and password rules that apply to every workspace on the platform."
    >
      <div className="space-y-6">
        <Controller
          control={control}
          name="settings.security.passwordlessLogin"
          render={({ field }) => (
            <SettingsToggleRow
              label="Passwordless sign-in (email link)"
              description="Allow members to sign in with a one-time email link instead of a password."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="settings.security.enableSSO"
          render={({ field }) => (
            <SettingsToggleRow
              label="Single Sign-On (SSO)"
              description="Reserved for SAML / OIDC integrations."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="settings.security.require2fa"
          render={({ field }) => (
            <SettingsToggleRow
              label="Require two-factor authentication"
              description="Force every member to enroll in 2FA before accessing dashboards."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Minimum password length" htmlFor="minLength">
            <Input
              id="minLength"
              type="number"
              min={6}
              max={64}
              {...register("settings.security.passwordPolicy.minLength", {
                valueAsNumber: true,
              })}
            />
          </SettingsField>
          <SettingsField label="Password expiry (days, 0 = never)" htmlFor="expiryDays">
            <Input
              id="expiryDays"
              type="number"
              min={0}
              max={365}
              {...register("settings.security.passwordPolicy.expiryDays", {
                valueAsNumber: true,
              })}
            />
          </SettingsField>
        </div>

        <Controller
          control={control}
          name="settings.security.passwordPolicy.requireUppercase"
          render={({ field }) => (
            <SettingsToggleRow
              label="Require uppercase letter"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="settings.security.passwordPolicy.requireNumbers"
          render={({ field }) => (
            <SettingsToggleRow
              label="Require number"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="settings.security.passwordPolicy.requireSpecial"
          render={({ field }) => (
            <SettingsToggleRow
              label="Require special character"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>
    </SettingsSection>
  );
}
