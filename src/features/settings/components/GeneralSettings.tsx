"use client";

import {
  Camera,
  Database,
  Globe,
  Info,
  Loader2,
  Lock,
  TrendingUp,
  UserRound,
  Webhook,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ErrorList from "@/components/ui/ErrorList";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CODES } from "@/app/auth/data/data";
import { TIME_ZONE_OPTIONS } from "@/lib/date/timezone-options";
import AddressField from "@/shared/components/address/AddressField";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import { InternationalPhoneField } from "@/shared/components/phone-number/International-phonefield";
import { useUpgradeWorkspace } from "@/shared/hooks/useWorkspaceActions";
import { isSoloWorkspaceType } from "@/shared/model/workspace.model";
import {
  WorkspaceProfileSettingsSchema,
  type WorkspaceProfileSettings,
} from "../models/settings.model";
import {
  useUpdateWorkspaceProfileSettings,
  useWorkspaceProfileSettings,
} from "../hooks/settingsHooks";
import { SettingsField } from "./SettingsField";
import { SettingsIconBadge } from "./SettingsIconBadge";
import { useSettingsSaveRegistration } from "./SettingsSaveContext";
import { SettingsSection } from "./SettingsSection";

type IntegrationKey = "googleCalendar" | "slack" | "mailchimp" | "zapier";

type IntegrationMeta = {
  key: IntegrationKey;
  name: string;
  description: string;
};

const defaultGeneralSettings: WorkspaceProfileSettings = {
  personalProfile: {
    name: "",
    email: "",
    contact: "",
    countryCode: "US",
  },
  business: {
    name: "",
    email: "",
    contact: "",
    countryCode: "US",
    logo: "",
    description: "",
    workspaceType: "BUSINESS",
    addressStructured: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      countryCode: "US",
      country: "United States",
      placeId: "",
      source: "manual",
    },
  },
  settings: {
    general: {
      timezone: "America/New_York",
      dateFormat: "mdy",
      timeFormat: "12h",
      language: "en",
      integrations: {
        googleCalendar: { connected: false },
        slack: { connected: false },
        mailchimp: { connected: false },
        zapier: { connected: false },
      },
    },
  },
  meta: {
    permissions: {
      isBusinessCreator: false,
      canEditBusinessDetails: false,
    },
  },
};

async function uploadWorkspaceImage(
  file: File,
  onProgress?: (percent: number) => void,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("resourceType", "image");
  onProgress?.(20);

  const response = await fetch("/api/cloudinary", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();
  onProgress?.(100);
  return data.secure_url || data.url;
}

function normalizedPhoneNumber(
  value: string | undefined,
  countryCode: string | undefined,
) {
  if (!value?.trim()) return "";
  const parsed = parsePhoneNumberFromString(
    value,
    (countryCode || "US") as CountryCode,
  );
  return parsed?.isValid() ? parsed.number : null;
}

function getPreviewImageSrc(value: string | null | undefined) {
  const src = value?.trim();
  if (!src || src === "default.jpg") return null;
  if (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("blob:") ||
    src.startsWith("data:")
  ) {
    return src;
  }
  return null;
}

export default function GeneralSettings() {
  const { data, isLoading, error } = useWorkspaceProfileSettings();
  const updateSettings = useUpdateWorkspaceProfileSettings();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewBlobUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const upgradeWorkspaceMutation = useUpgradeWorkspace();

  const form = useForm<WorkspaceProfileSettings>({
    resolver: zodResolver(WorkspaceProfileSettingsSchema) as never,
    defaultValues: defaultGeneralSettings,
    mode: "onChange",
  });

  const {
    control,
    formState: { isDirty },
    setError,
    setValue,
    watch,
  } = form;
  const business = watch("business");
  const general = watch("settings.general");
  const personalProfile = watch("personalProfile");
  const permissions = watch("meta.permissions");
  const isSoloWorkspace = isSoloWorkspaceType(business.workspaceType);
  const workspaceEntityLabel = isSoloWorkspace ? "Workspace" : "Business";
  const workspaceOwnerLabel = isSoloWorkspace
    ? "workspace creator"
    : "business creator";
  const isSaving = updateSettings.isPending;

  useEffect(() => {
    if (!data) return;
    form.reset(data);
    setPreviewUrl(getPreviewImageSrc(data.business.logo));
  }, [data, form]);

  useEffect(() => {
    return () => {
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
      }
    };
  }, []);

  const integrations = useMemo<IntegrationMeta[]>(
    () => [
      {
        key: "googleCalendar",
        name: "Google Calendar",
        description: "Sync maintenance events with Google Calendar",
      },
      {
        key: "slack",
        name: "Slack",
        description: "Send notifications to Slack channels",
      },
      {
        key: "mailchimp",
        name: "Mailchimp",
        description: "Sync workspace contacts with mailing lists",
      },
      {
        key: "zapier",
        name: "Zapier",
        description: "Automate workflows with 5000+ apps",
      },
    ],
    [],
  );

  const handleLogoClick = () => {
    if (isUploadingLogo || !permissions.canEditBusinessDetails) return;
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setUploadError(null);

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (previewBlobUrlRef.current) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewBlobUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);

    try {
      setIsUploadingLogo(true);
      setUploadProgress(0);
      const logoUrl = await uploadWorkspaceImage(file, setUploadProgress);
      const saved = await updateSettings.mutateAsync({
        business: { logo: logoUrl },
      });
      form.reset(saved.data);
      setPreviewUrl(logoUrl);
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
      }
      router.refresh();
      toast.success(`${workspaceEntityLabel} icon updated.`);
    } catch (uploadFailure) {
      setPreviewUrl(getPreviewImageSrc(business.logo));
      setUploadError(
        uploadFailure instanceof Error
          ? uploadFailure.message
          : `Unable to upload ${workspaceEntityLabel.toLowerCase()} icon.`,
      );
    } finally {
      setIsUploadingLogo(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = useCallback(
    async (values: WorkspaceProfileSettings) => {
      const personalPhone = normalizedPhoneNumber(
        values.personalProfile.contact,
        values.personalProfile.countryCode,
      );
      if (personalPhone === null) {
        setError("personalProfile.contact", {
          message: "Enter a valid phone number.",
        });
        return;
      }

      const saved = await updateSettings.mutateAsync({
        personalProfile: {
          ...values.personalProfile,
          contact: personalPhone,
        },
        business: {
          name: values.business.name,
          description: values.business.description,
          addressStructured: values.business.addressStructured,
        },
        settings: values.settings,
      });

      form.reset(saved.data);
      setPreviewUrl(getPreviewImageSrc(saved.data.business.logo));
    },
    [form, setError, updateSettings.mutateAsync],
  );

  const saveGeneralSettings = useCallback(
    () => form.handleSubmit(handleSave)(),
    [form, handleSave],
  );

  const generalSaveSection = useMemo(
    () => ({
      id: "general",
      label: "General settings",
      save: saveGeneralSettings,
      isDirty,
      isSaving,
      isLoading,
      disabled: isUploadingLogo,
      disabledReason: isUploadingLogo
        ? "Wait for the workspace icon upload to finish before saving settings."
        : undefined,
    }),
    [isDirty, isLoading, isSaving, isUploadingLogo, saveGeneralSettings],
  );

  useSettingsSaveRegistration(generalSaveSection);

  return (
    <SettingsSection
      title="General Settings"
      icon={Globe}
      description={`Configure general ${workspaceEntityLabel.toLowerCase()} and app settings`}
    >
      <ErrorList error={error || updateSettings.error} />

      <Form<WorkspaceProfileSettings>
        {...form}
        schema={WorkspaceProfileSettingsSchema}
      >
        <form
          id="general-settings-form"
          onSubmit={form.handleSubmit(handleSave)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleLogoChange(event)}
            />

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleLogoClick}
                disabled={isUploadingLogo || !permissions.canEditBusinessDetails}
                className="group flex w-full items-center gap-4 rounded-xl border border-border/70 bg-muted/40 p-4 text-left transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={`${business.name || workspaceEntityLabel} icon`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Globe className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/35">
                    {isUploadingLogo ? (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/60 text-xs font-semibold text-white">
                        {uploadProgress}%
                      </div>
                    ) : (
                      <Camera className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {workspaceEntityLabel} Icon
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {permissions.canEditBusinessDetails
                      ? `Click the preview to upload or replace the icon used across your ${workspaceEntityLabel.toLowerCase()} workspace.`
                      : `Only the ${workspaceOwnerLabel} can update the ${workspaceEntityLabel.toLowerCase()} icon.`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: square image, PNG or JPG.
                  </p>
                  {isUploadingLogo ? (
                    <div className="space-y-2 pt-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-[width]"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uploading icon... {uploadProgress}%
                      </p>
                    </div>
                  ) : null}
                </div>
              </button>

              {uploadError ? <ErrorList error={uploadError} /> : null}
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/35 p-4 sm:col-span-2">
              <SettingsIconBadge
                icon={Info}
                className="bg-muted text-muted-foreground"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Personal profile access
                </p>
                <p className="text-sm text-muted-foreground">
                  {permissions.isBusinessCreator
                    ? `Your personal name and phone are editable here. You can also manage creator-owned ${workspaceEntityLabel.toLowerCase()} information below.`
                    : `Your personal name and phone are editable here. ${workspaceEntityLabel} information below stays read-only unless you are the ${workspaceOwnerLabel}.`}
                </p>
              </div>
            </div>

            {isSoloWorkspace ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <SettingsIconBadge
                      icon={TrendingUp}
                      className="bg-primary/10 text-primary"
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Upgrade to a Business Workspace
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {permissions.isBusinessCreator
                          ? "Unlock team invitations, team management, and business workspace capabilities for this workspace."
                          : `Only the ${workspaceOwnerLabel} can upgrade this workspace to a business workspace.`}
                      </p>
                    </div>
                  </div>

                  {permissions.isBusinessCreator ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={upgradeWorkspaceMutation.isPending}
                      onClick={() => setUpgradeDialogOpen(true)}
                    >
                      {upgradeWorkspaceMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <TrendingUp className="size-4" />
                      )}
                      Upgrade Workspace
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-foreground">
                    Personal Details
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Manage your own workspace profile details here.{" "}
                    {workspaceEntityLabel} creators can also edit
                    creator-managed settings below.
                  </p>
                </div>
                <SettingsIconBadge icon={UserRound} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SettingsField label="Your Name" htmlFor="personal-name">
                  <Input
                    id="personal-name"
                    value={personalProfile.name ?? ""}
                    disabled={isLoading}
                    onChange={(event) =>
                      setValue("personalProfile.name", event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </SettingsField>

                <SettingsField label="Your Email" htmlFor="personal-email">
                  <Input
                    id="personal-email"
                    type="email"
                    value={personalProfile.email ?? ""}
                    disabled
                    readOnly
                  />
                </SettingsField>

                <InternationalPhoneField<WorkspaceProfileSettings>
                  name="personalProfile.contact"
                  control={control}
                  label="Your Phone"
                  allowedCountries={CODES}
                  defaultCountry={
                    (personalProfile.countryCode as (typeof CODES)[number]) ||
                    "US"
                  }
                  placeholderByCountry={{ US: "202-555-0145" }}
                  showFlags
                  enforceDigitHints
                  disabled={isLoading}
                  onCountryChange={(country) => {
                    setValue("personalProfile.countryCode", country, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-foreground">
                    {workspaceEntityLabel} Information
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {workspaceEntityLabel} name, website, logo, and address are
                    creator-managed. {workspaceEntityLabel} email and phone are
                    locked for everyone.
                  </p>
                </div>
                {!permissions.canEditBusinessDetails ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-xs text-muted-foreground">
                    <Lock className="size-3.5" />
                    Read only
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SettingsField
                  label={`${workspaceEntityLabel} Name`}
                  htmlFor="business-name"
                >
                  <Input
                    id="business-name"
                    value={business.name}
                    disabled={!permissions.canEditBusinessDetails}
                    onChange={(event) =>
                      setValue("business.name", event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </SettingsField>

                <SettingsField
                  label={`${workspaceEntityLabel} Email`}
                  htmlFor="business-email"
                >
                  <Input
                    id="business-email"
                    type="email"
                    value={business.email ?? ""}
                    disabled
                    readOnly
                  />
                </SettingsField>

                <InternationalPhoneField<WorkspaceProfileSettings>
                  name="business.contact"
                  control={control}
                  label={`${workspaceEntityLabel} Phone Number`}
                  allowedCountries={CODES}
                  defaultCountry={
                    (business.countryCode as (typeof CODES)[number]) || "US"
                  }
                  placeholderByCountry={{ US: "202-555-0145" }}
                  showFlags
                  enforceDigitHints
                  disabled
                />

                <SettingsField label="Website" htmlFor="business-website">
                  <Input
                    id="business-website"
                    type="url"
                    placeholder="https://example.com"
                    value={business.description ?? ""}
                    disabled={!permissions.canEditBusinessDetails}
                    onChange={(event) =>
                      setValue("business.description", event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </SettingsField>
              </div>

              <div className="mt-4 space-y-3">
                <SettingsField label="Address">
                  <div
                    className={
                      permissions.canEditBusinessDetails
                        ? ""
                        : "pointer-events-none opacity-70"
                    }
                  >
                    <AddressField<WorkspaceProfileSettings> namePrefix="business.addressStructured" />
                  </div>
                </SettingsField>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Localization
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="settings.general.timezone"
                render={({ field }) => (
                  <SettingsField label="Timezone">
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue("settings.general.timezone", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_ZONE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingsField>
                )}
              />

              <Controller
                control={control}
                name="settings.general.dateFormat"
                render={({ field }) => (
                  <SettingsField label="Date Format">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsField>
                )}
              />

              <Controller
                control={control}
                name="settings.general.timeFormat"
                render={({ field }) => (
                  <SettingsField label="Time Format">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsField>
                )}
              />

              <Controller
                control={control}
                name="settings.general.language"
                render={({ field }) => (
                  <SettingsField label="Language">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsField>
                )}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                Integrations
              </h4>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="space-y-3">
              {integrations.map((integration) => {
                const connected =
                  general.integrations[integration.key].connected;

                return (
                  <div
                    key={integration.key}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/35 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <SettingsIconBadge
                        icon={Database}
                        className="bg-muted text-muted-foreground"
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {integration.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={connected ? "outline" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setValue(
                          `settings.general.integrations.${integration.key}.connected`,
                          !connected,
                          { shouldDirty: true, shouldValidate: true },
                        );
                      }}
                    >
                      {connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Form>

      <ActionConfirmDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        title="Upgrade to Business Workspace"
        description="This will convert your current solo owner workspace into a business workspace and enable team invitations for future collaborators."
        confirmLabel={
          upgradeWorkspaceMutation.isPending
            ? "Upgrading..."
            : "Upgrade Workspace"
        }
        icon={TrendingUp}
        isLoading={upgradeWorkspaceMutation.isPending}
        onConfirm={async () => {
          await upgradeWorkspaceMutation.mutateAsync();
          setUpgradeDialogOpen(false);
        }}
      />
    </SettingsSection>
  );
}
