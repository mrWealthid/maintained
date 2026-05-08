"use client";

import { useEffect } from "react";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Building2, Loader2, Sparkles } from "lucide-react";

import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ErrorList from "@/components/ui/ErrorList";
import AddressField from "@/shared/components/address/AddressField";
import { InternationalPhoneField } from "@/shared/components/phone-number/International-phonefield";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { makeEmptyAddress } from "@/lib/validation/address";
import {
  DEFAULT_TIME_ZONE,
  detectBrowserTimeZone,
  TIME_ZONE_OPTIONS,
} from "@/lib/date/timezone-options";
import { CODES } from "@/app/auth/data/data";
import {
  CreateWorkspaceSchema,
  type CreateWorkspaceValues,
} from "@/shared/model/workspace-create.model";
import {
  getWorkspaceTypeLabel,
  WORKSPACE_TYPE,
} from "@/shared/model/workspace.model";
import { useCreateWorkspace } from "@/shared/hooks/useWorkspaceActions";

type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const createWorkspaceMutation = useCreateWorkspace();
  const form = useForm<CreateWorkspaceValues>({
    resolver: zodResolver(CreateWorkspaceSchema),
    mode: "onChange",
    defaultValues: {
      workspaceType: WORKSPACE_TYPE.BUSINESS,
      businessName: "",
      businessEmail: "",
      businessContact: "",
      businessCountryCode: "US",
      timezone: DEFAULT_TIME_ZONE,
      addressStructured: makeEmptyAddress("US"),
    },
  });

  const workspaceType = useWatch({
    control: form.control,
    name: "workspaceType",
  }) ?? WORKSPACE_TYPE.BUSINESS;
  const isSoloWorkspace = workspaceType === WORKSPACE_TYPE.INDIVIDUAL;
  const workspaceNameLabel = isSoloWorkspace
    ? "Workspace Name"
    : "Business / Organization Name";
  const workspaceEmailLabel = isSoloWorkspace
    ? "Workspace Email (Optional)"
    : "Business Email (Optional)";
  const workspacePhoneLabel = isSoloWorkspace
    ? "Workspace Phone (Optional)"
    : "Business Phone (Optional)";

  useEffect(() => {
    if (!open) return;

    form.setValue("timezone", detectBrowserTimeZone(), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [form, open]);

  useEffect(() => {
    if (open) return;

    form.reset({
      workspaceType: WORKSPACE_TYPE.BUSINESS,
      businessName: "",
      businessEmail: "",
      businessContact: "",
      businessCountryCode: "US",
      timezone: detectBrowserTimeZone(),
      addressStructured: makeEmptyAddress("US"),
    });
  }, [form, open]);

  const onSubmit = async (values: CreateWorkspaceValues) => {
    let businessE164 = "";

    if (values.businessContact && values.businessCountryCode) {
      const parsed = parsePhoneNumberFromString(
        values.businessContact,
        values.businessCountryCode as CountryCode,
      );

      if (!parsed || !parsed.isValid()) {
        form.setError("businessContact", {
          type: "manual",
          message: "Enter a valid workspace phone number",
        });
        return;
      }

      businessE164 = parsed.number as string;
    }

    try {
      await createWorkspaceMutation.mutateAsync({
        ...values,
        businessEmail: values.businessEmail || "",
        businessContact: businessE164,
      });
    } catch {
      // ErrorList and the mutation toast render the failure; keep the sheet open.
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent
        side="right"
        className="w-screen max-w-screen sm:max-w-2xl"
      >
        <AppSheetHeader
          title="Create New Workspace"
          description="Launch another workspace under your existing account and switch into it immediately."
          icon={Building2}
        />

        <AppSheetBody>
          <ErrorList error={createWorkspaceMutation.error} />

          <Form {...form} schema={CreateWorkspaceSchema}>
            <form
              id="create-workspace-form"
              onSubmit={form.handleSubmit((values) => void onSubmit(values))}
              className="space-y-6"
            >
              <section className="rounded-lg border border-border/70 bg-muted/20 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Workspace Type
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="workspaceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Choose the workspace setup that matches how you manage maintenance operations
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid gap-3 md:grid-cols-2"
                        >
                          <Label
                            htmlFor="create-workspace-type-business"
                            className="cursor-pointer rounded-lg border border-border/70 bg-background px-4 py-4"
                          >
                            <RadioGroupItem
                              id="create-workspace-type-business"
                              value={WORKSPACE_TYPE.BUSINESS}
                            />
                            <div className="space-y-1">
                              <span className="text-sm font-semibold text-foreground">
                                Business
                              </span>
                              <p className="text-sm font-normal leading-6 text-muted-foreground">
                                Create a business workspace with room for staff and team access.
                              </p>
                            </div>
                          </Label>
                          <Label
                            htmlFor="create-workspace-type-individual"
                            className="cursor-pointer rounded-lg border border-border/70 bg-background px-4 py-4"
                          >
                            <RadioGroupItem
                              id="create-workspace-type-individual"
                              value={WORKSPACE_TYPE.INDIVIDUAL}
                            />
                            <div className="space-y-1">
                              <span className="text-sm font-semibold text-foreground">
                                Solo Owner
                              </span>
                              <p className="text-sm font-normal leading-6 text-muted-foreground">
                                Manage a smaller property workspace on your own without staff access.
                              </p>
                            </div>
                          </Label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="rounded-lg border border-border/70 bg-muted/20 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {getWorkspaceTypeLabel(workspaceType, { short: true })} Details
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{workspaceNameLabel}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              isSoloWorkspace
                                ? "Enter your workspace name"
                                : "Enter business name"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{workspaceEmailLabel}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <InternationalPhoneField
                    name="businessContact"
                    control={form.control}
                    label={workspacePhoneLabel}
                    allowedCountries={CODES}
                    defaultCountry="US"
                    placeholderByCountry={{ US: "202-555-0145" }}
                    showFlags
                    enforceDigitHints
                    onCountryChange={(country) => {
                      setTimeout(() => {
                        form.setValue("businessCountryCode", country as (typeof CODES)[number], {
                          shouldValidate: true,
                        });
                      }, 0);
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workspace Timezone</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_ZONE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-border/70 bg-muted/20 p-5">
                <div className="mb-4 space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Workspace Address
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This address is used as the primary location for the new workspace.
                  </p>
                </div>
                <AddressField namePrefix="addressStructured" />
              </section>
            </form>
          </Form>
        </AppSheetBody>

        <AppSheetFooter>
          <Button
            type="button"
            variant="outline"
            disabled={createWorkspaceMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-workspace-form"
            disabled={createWorkspaceMutation.isPending}
          >
            {createWorkspaceMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Create Workspace
          </Button>
        </AppSheetFooter>
      </AppSheetContent>
    </Sheet>
  );
}
