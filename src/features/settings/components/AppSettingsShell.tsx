"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import AppPageHeader from "@/shared/components/app-header/AppPageHeader";

import {
  appSettingsSchema,
  type AppSettingsFormValues,
} from "../models/app-settings-form.model";
import type { AppSettingsPayload } from "../models/app-settings.model";
import { defaultAppSettings } from "../data/app-settings-data";
import { useAppSettings, useSaveAppSettings } from "../hooks/use-app-settings";
import { AppSettingsTabs, type AppSettingsTabValue } from "./AppSettingsTabs";

export function AppSettingsShell({
  defaultTab = "security",
}: {
  defaultTab?: AppSettingsTabValue;
}) {
  const { data, isLoading } = useAppSettings();
  const { mutateAsync, isPending } = useSaveAppSettings();

  const form = useForm<AppSettingsFormValues>({
    resolver: zodResolver(appSettingsSchema) as never,
    defaultValues: {
      settings: defaultAppSettings,
    },
    mode: "onChange",
  });
  const {
    formState: { isDirty },
  } = form;

  useEffect(() => {
    if (!data?.settings) return;
    form.reset({ settings: data.settings });
  }, [data, form]);

  const onSubmit = async (values: AppSettingsFormValues) => {
    const saved = await mutateAsync(values as AppSettingsPayload);
    if (saved.data?.settings) {
      form.reset({ settings: saved.data.settings });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AppPageHeader
          title="Platform Settings"
          description="Toggles below apply to every workspace on the platform."
          actions={
            <Button type="submit" disabled={isPending || isLoading || !isDirty}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          }
        />

        <AppSettingsTabs defaultTab={defaultTab} />
      </form>
    </FormProvider>
  );
}
