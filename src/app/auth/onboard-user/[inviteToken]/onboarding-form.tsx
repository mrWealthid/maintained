"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FC, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { useInvitePreview, useOnboardUser } from "../../hooks/useAuth";
import {
  OnboardUserForm,
  OnboardUserFormSchema,
} from "../../model/model";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import AuthWrapper from "../../AuthWrapper";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
  UserPlus2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InternationalPhoneField } from "@/shared/components/phone-number/International-phonefield";
import { CODES } from "../../data/data";
import ErrorList from "@/components/ui/ErrorList";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { usePasswordPolicy } from "@/shared/hooks/usePasswordPolicy";
import { PasswordStrengthIndicator } from "@/shared/components/auth/PasswordStrengthIndicator";
import {
  DEFAULT_PASSWORD_POLICY,
  getPasswordPolicyValidationMessage,
} from "@/lib/security/password-policy.shared";
import { formatWorkspaceRoleLabel } from "@/shared/auth/roles";

const OnboardingForm: FC<{ inviteToken: string }> = ({ inviteToken }) => {
  const form = useForm<OnboardUserForm>({
    resolver: zodResolver(OnboardUserFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      contact: "",
      countryCode: "US",
    },
  });

  const {
    control,
    setValue,
    reset,
    formState: { isValid },
  } = form;
  const passwordValue = useWatch({
    control: form.control,
    name: "password",
  }) ?? "";
  const { data: passwordPolicyData } = usePasswordPolicy();
  const passwordPolicy = passwordPolicyData ?? DEFAULT_PASSWORD_POLICY;
  const passwordPolicyMessage = passwordValue
    ? getPasswordPolicyValidationMessage(passwordValue, passwordPolicy)
    : null;

  const router = useRouter();
  const invitePreviewQuery = useInvitePreview(inviteToken);
  const { isLoading, onboardUser } = useOnboardUser();
  const invitePreview = invitePreviewQuery.data?.data;
  const requiresAccountSetup = invitePreview?.requiresAccountSetup ?? true;
  const roleLabel = invitePreview
    ? formatWorkspaceRoleLabel(invitePreview.role)
    : "Team member";

  useEffect(() => {
    if (!invitePreview) return;
    reset({
      email: invitePreview.email,
      password: "",
      contact: "",
      countryCode: "US",
    });
  }, [invitePreview, reset]);

  async function onSubmit(payload: OnboardUserForm) {
    if (passwordPolicyMessage) {
      form.setError("password", {
        type: "manual",
        message: passwordPolicyMessage,
      });
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(
      payload.contact,
      payload.countryCode as CountryCode,
    );
    if (!parsedPhone || !parsedPhone.isValid()) {
      form.setError("contact", { message: "Enter a valid phone number" });
      return;
    }

    const data = {
      password: payload.password,
      contact: parsedPhone.number,
      countryCode: payload.countryCode,
      inviteToken,
    };

    onboardUser(data, { onSuccess: () => router.push("/auth/login") });
  }

  async function acceptExistingAccountInvite() {
    onboardUser(
      { inviteToken },
      { onSuccess: () => router.push("/auth/login") },
    );
  }

  function onError(err: unknown) {
    console.log(err);
  }

  const [showPassword, setShowPassword] = useState(false);
  let activationContent: React.ReactNode;

  if (invitePreviewQuery.isLoading) {
    activationContent = (
      <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Validating your invite...
      </div>
    );
  } else if (invitePreview && !requiresAccountSetup) {
    activationContent = (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
          <p>
            This email already has an account. Accepting this invite will add{" "}
            <span className="font-medium text-foreground">
              {invitePreview.businessName}
            </span>{" "}
            to your available workspaces as{" "}
            <span className="font-medium text-foreground">{roleLabel}</span>.
          </p>
        </div>

        <Button
          type="button"
          disabled={isLoading || invitePreviewQuery.isError}
          onClick={acceptExistingAccountInvite}
        >
          {isLoading ? "Processing..." : "Accept workspace invite"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Prefer to sign in first?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Go to login
          </Link>
        </p>
      </div>
    );
  } else {
    activationContent = (
      <Form {...form} schema={OnboardUserFormSchema}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="flex w-full flex-col items-stretch justify-center gap-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled readOnly />
                </FormControl>
              </FormItem>
            )}
          />

          <InternationalPhoneField
            name="contact"
            control={control}
            label="Phone"
            allowedCountries={CODES}
            placeholderByCountry={{ US: "202-555-0145" }}
            showFlags
            enforceDigitHints
            onCountryChange={(country) => {
              setValue("countryCode", country as (typeof CODES)[number], {
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <InputGroup>
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
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff data-icon="inline-end" className="size-4" />
                          ) : (
                            <Eye data-icon="inline-end" className="size-4" />
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

          <Button
            type="submit"
            disabled={
              !isValid ||
              isLoading ||
              invitePreviewQuery.isError ||
              Boolean(passwordPolicyMessage)
            }
          >
            {isLoading ? "Processing..." : "Activate account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already activated your account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    );
  }

  return (
    <AuthWrapper>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="w-full border-border/70 bg-card/95 shadow-sm lg:max-w-sm">
          <CardHeader className="space-y-5">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserPlus2 className="size-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Complete your invitation
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground/90">
                {requiresAccountSetup
                  ? "Activate your access by confirming your phone number and setting a password for your invited workspace."
                  : "Confirm this workspace invitation for your existing account and keep moving."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitePreview ? (
              <div className="rounded-2xl border border-border/70 bg-muted/35 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    You&apos;re joining{" "}
                    <span className="font-medium text-foreground">
                      {invitePreview.businessName}
                    </span>{" "}
                    as{" "}
                    <span className="font-medium text-foreground">{roleLabel}</span>
                    .
                  </p>
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  {requiresAccountSetup
                    ? "Your invitation email is locked to this account. Once you submit the form, you can sign in normally."
                    : "This invite is tied to your existing account email. Accept it here, then sign in and switch into the workspace."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full lg:max-w-2xl">
          <ErrorList error={invitePreviewQuery.error} title="Invite error" />

          <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                Activate your account
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground/90">
                Confirm the invite details below and finish your first-time setup.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {activationContent}
            </CardContent>
          </Card>
        </div>
      </section>
    </AuthWrapper>
  );
};

export default OnboardingForm;
