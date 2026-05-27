"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import {
  Building2,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";

import { useRegister } from "../hooks/useAuth";
import AuthWrapper from "../AuthWrapper";
import { SignupSchema, SignupValues } from "../model/model";
import { CODES } from "../data/data";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ErrorList from "@/components/ui/ErrorList";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";

import { makeEmptyAddress } from "@/lib/validation/address";
import AddressField from "@/shared/components/address/AddressField";
import { InternationalPhoneField } from "@/shared/components/phone-number/International-phonefield";
import {
  DEFAULT_TIME_ZONE,
  detectBrowserTimeZone,
  TIME_ZONE_OPTIONS,
} from "@/lib/date/timezone-options";
import { usePasswordPolicy } from "@/shared/hooks/usePasswordPolicy";
import { PasswordStrengthIndicator } from "@/shared/components/auth/PasswordStrengthIndicator";
import {
  DEFAULT_PASSWORD_POLICY,
  getPasswordPolicyValidationMessage,
} from "@/lib/security/password-policy.shared";
import {
  getWorkspaceTypeLabel,
  WORKSPACE_TYPE,
} from "@/shared/model/workspace.model";

export default function SignupComponent() {
  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
    defaultValues: {
      workspaceType: WORKSPACE_TYPE.BUSINESS,
      name: "",
      email: "",
      contact: "",
      countryCode: "US",
      password: "",
      businessName: "",
      businessEmail: "",
      businessContact: "",
      businessCountryCode: "US",
      timezone: DEFAULT_TIME_ZONE,
      addressStructured: makeEmptyAddress("US"),
    },
  });

  const {
    control,
    setValue,
    formState: { isValid },
  } = form;
  const passwordValue =
    useWatch({ control: form.control, name: "password" }) ?? "";
  const workspaceType =
    useWatch({ control: form.control, name: "workspaceType" }) ??
    WORKSPACE_TYPE.BUSINESS;
  const isSoloOrganizerSignup =
    workspaceType === WORKSPACE_TYPE.INDIVIDUAL;
  const workspaceTypeLabel = getWorkspaceTypeLabel(workspaceType, {
    short: true,
  });
  const workspaceNameLabel = isSoloOrganizerSignup
    ? "Workspace Name"
    : "Business / Organization Name";
  const workspaceNamePlaceholder = isSoloOrganizerSignup
    ? "Enter your workspace name"
    : "Enter business name";
  const workspaceEmailLabel = isSoloOrganizerSignup
    ? "Workspace Email (Optional)"
    : "Business Email (Optional)";
  const workspacePhoneLabel = isSoloOrganizerSignup
    ? "Workspace Phone (Optional)"
    : "Business Phone (Optional)";
  const workspaceTimezoneLabel = isSoloOrganizerSignup
    ? "Workspace Timezone"
    : "Business Timezone";
  const workspaceAddressLabel = isSoloOrganizerSignup
    ? "Workspace Address (US)"
    : "Business Address (US)";

  const { data: passwordPolicyData } = usePasswordPolicy();
  const passwordPolicy = passwordPolicyData ?? DEFAULT_PASSWORD_POLICY;
  const passwordPolicyMessage = passwordValue
    ? getPasswordPolicyValidationMessage(passwordValue, passwordPolicy)
    : null;

  const { isLoading, registering, error } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setValue("timezone", detectBrowserTimeZone(), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [setValue]);

  const onSubmit = (data: SignupValues) => {
    if (passwordPolicyMessage) {
      form.setError("password", {
        type: "manual",
        message: passwordPolicyMessage,
      });
      return;
    }

    const userPhoneParsed = parsePhoneNumberFromString(
      data.contact,
      data.countryCode as CountryCode,
    );
    if (!userPhoneParsed || !userPhoneParsed.isValid()) {
      form.setError("contact", {
        type: "manual",
        message: "Enter a valid phone number",
      });
      return;
    }
    const userE164 = userPhoneParsed.number as string;

    let businessE164: string | undefined;
    if (data.businessContact && data.businessCountryCode) {
      const businessPhoneParsed = parsePhoneNumberFromString(
        data.businessContact,
        data.businessCountryCode as CountryCode,
      );
      if (businessPhoneParsed && businessPhoneParsed.isValid()) {
        businessE164 = businessPhoneParsed.number as string;
      }
    }

    registering({
      workspaceType: data.workspaceType,
      name: data.name,
      email: data.email,
      password: data.password,
      contact: userE164,
      countryCode: data.countryCode,
      businessName: data.businessName,
      businessEmail: data.businessEmail || undefined,
      businessContact: businessE164,
      businessCountryCode: data.businessCountryCode,
      timezone: data.timezone,
      addressStructured: data.addressStructured,
    });
  };

  return (
    <AuthWrapper>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="space-y-2">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Create your account
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground/90">
              Launch your workspace with personal details,{" "}
              {isSoloOrganizerSignup ? "solo organizer" : "business"} identity,
              timezone, and address all in one guided setup.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRound className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Owner profile</p>
                  <p>Start with your personal owner details and a secure password.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {workspaceTypeLabel} setup
                  </p>
                  <p>Name, contact, timezone, and address are configured here.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Creator access</p>
                  <p>The signup account becomes the workspace creator by default.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full space-y-4">
          <ErrorList error={error} title="Signup error" />

          <Card className="w-full border-border/70 bg-card/95 shadow-sm">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                Sign Up
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground/90">
                Create your Properly account and launch a{" "}
                {workspaceTypeLabel.toLowerCase()} workspace
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form} schema={SignupSchema}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full flex flex-col gap-4"
                >
                  {/* Workspace Type */}
                  <section className="w-full rounded-2xl border border-border/70 bg-muted/20 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
                            Choose the workspace setup that matches how you operate
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="grid gap-3 md:grid-cols-2"
                            >
                              <Label
                                htmlFor="workspace-type-business"
                                className="cursor-pointer rounded-2xl border border-border/70 bg-background px-4 py-4"
                              >
                                <RadioGroupItem
                                  id="workspace-type-business"
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
                                htmlFor="workspace-type-individual"
                                className="cursor-pointer rounded-2xl border border-border/70 bg-background px-4 py-4"
                              >
                                <RadioGroupItem
                                  id="workspace-type-individual"
                                  value={WORKSPACE_TYPE.INDIVIDUAL}
                                />
                                <div className="space-y-1">
                                  <span className="text-sm font-semibold text-foreground">
                                    Solo Organizer
                                  </span>
                                  <p className="text-sm font-normal leading-6 text-muted-foreground">
                                    Run things on your own with a lightweight workspace built for solo operators.
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

                  {/* Personal Information */}
                  <section className="w-full rounded-2xl border border-border/70 bg-muted/20 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <UserRound className="size-4" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Personal Information
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <UserRound className="size-4 text-primary" />
                              <span>Your Name</span>
                            </FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon
                                  align="inline-start"
                                  className="pointer-events-none"
                                >
                                  <UserRound className="size-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput
                                  placeholder="Enter Your Name"
                                  {...field}
                                />
                              </InputGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="size-4 text-primary" />
                              <span>Your Email</span>
                            </FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon
                                  align="inline-start"
                                  className="pointer-events-none"
                                >
                                  <Mail className="size-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput
                                  type="email"
                                  placeholder="your.email@example.com"
                                  {...field}
                                />
                              </InputGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <InternationalPhoneField
                        name="contact"
                        control={control}
                        label="Your Phone"
                        allowedCountries={CODES}
                        placeholderByCountry={{ US: "202-555-0145" }}
                        showFlags
                        enforceDigitHints
                        onCountryChange={(c) => {
                          setValue("countryCode", c as (typeof CODES)[number], {
                            shouldValidate: true,
                          });
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field, fieldState }) => {
                          const feedbackMessage =
                            fieldState.error?.message ||
                            (field.value ? passwordPolicyMessage : null);

                          return (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <KeyRound className="size-4 text-primary" />
                                <span>Password</span>
                              </FormLabel>
                              <FormControl>
                                <InputGroup>
                                  <InputGroupAddon
                                    align="inline-start"
                                    className="pointer-events-none"
                                  >
                                    <KeyRound className="size-4 text-muted-foreground" />
                                  </InputGroupAddon>
                                  <InputGroupInput
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    value={field.value ?? ""}
                                    placeholder="Enter password"
                                    autoComplete="new-password"
                                    onChange={(event) => {
                                      field.onChange(event);
                                      if (fieldState.error?.type === "manual") {
                                        form.clearErrors("password");
                                      }
                                    }}
                                  />
                                  <InputGroupAddon align="inline-end">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        setShowPassword((s) => !s)
                                      }
                                      aria-label={
                                        showPassword
                                          ? "Hide password"
                                          : "Show password"
                                      }
                                    >
                                      {showPassword ? (
                                        <EyeOff className="size-4" />
                                      ) : (
                                        <Eye className="size-4" />
                                      )}
                                    </Button>
                                  </InputGroupAddon>
                                </InputGroup>
                              </FormControl>

                              {feedbackMessage ? (
                                <ErrorMessage errorMsg={feedbackMessage} />
                              ) : null}

                              <PasswordStrengthIndicator
                                password={field.value ?? ""}
                                policy={passwordPolicy}
                              />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  </section>

                  {/* Workspace Information */}
                  <section className="w-full rounded-2xl border border-border/70 bg-muted/20 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="size-4" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {workspaceTypeLabel} Information
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Building2 className="size-4 text-primary" />
                              <span>{workspaceNameLabel}</span>
                            </FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon
                                  align="inline-start"
                                  className="pointer-events-none"
                                >
                                  <Building2 className="size-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput
                                  placeholder={workspaceNamePlaceholder}
                                  {...field}
                                />
                              </InputGroup>
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
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="size-4 text-primary" />
                              <span>{workspaceEmailLabel}</span>
                            </FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon
                                  align="inline-start"
                                  className="pointer-events-none"
                                >
                                  <Mail className="size-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput
                                  type="email"
                                  placeholder="business@example.com"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </InputGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <InternationalPhoneField
                        name="businessContact"
                        control={control}
                        label={workspacePhoneLabel}
                        allowedCountries={CODES}
                        placeholderByCountry={{ US: "202-555-0145" }}
                        showFlags
                        enforceDigitHints
                        onCountryChange={(c) => {
                          setValue(
                            "businessCountryCode",
                            c as (typeof CODES)[number],
                            { shouldValidate: true },
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Globe2 className="size-4 text-primary" />
                              <span>{workspaceTimezoneLabel}</span>
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TIME_ZONE_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
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

                    <div className="my-4">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-primary" />
                        <FormLabel
                          className="text-xs text-muted-foreground"
                          required
                        >
                          {workspaceAddressLabel}
                        </FormLabel>
                      </div>
                      <AddressField namePrefix="addressStructured" />
                    </div>
                  </section>

                  <Button
                    type="submit"
                    disabled={
                      !isValid || isLoading || Boolean(passwordPolicyMessage)
                    }
                  >
                    {isLoading ? "Processing..." : "Create Workspace"}
                  </Button>

                  <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      Login
                    </Link>
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </AuthWrapper>
  );
}
