"use client";

import Link from "next/link";
import React, { FC, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useUpdatePassword } from "../../hooks/useAuth";
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
import AuthWrapper from "../../AuthWrapper";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

type UpdatePasswordFormValues = {
  newPassword: string;
};

export const UpdatePasswordForm: FC<{
  token: string;
  email?: string;
}> = ({ token, email }) => {
  const form = useForm<UpdatePasswordFormValues>({
    mode: "onChange",
  });
  const passwordValue = useWatch({
    control: form.control,
    name: "newPassword",
  }) ?? "";
  const { data: passwordPolicyData } = usePasswordPolicy();
  const passwordPolicy = passwordPolicyData ?? DEFAULT_PASSWORD_POLICY;
  const passwordPolicyMessage = passwordValue
    ? getPasswordPolicyValidationMessage(passwordValue, passwordPolicy)
    : null;

  const { isLoading, updatePassword } = useUpdatePassword();
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  async function onSubmit(payload: UpdatePasswordFormValues) {
    if (passwordPolicyMessage) {
      form.setError("newPassword", {
        type: "manual",
        message: passwordPolicyMessage,
      });
      return;
    }

    updatePassword(
      {
        newPassword: payload.newPassword,
        resetToken: token,
      },
      { onSuccess: () => setSuccess(true) },
    );
  }

  const {
    formState: { isValid },
  } = form;

  if (success) {
    return (
      <AuthWrapper>
        <section className="mx-auto w-full max-w-3xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground leading-tight">
                  Password updated
                </h1>
                <p className="text-sm text-muted-foreground leading-tight">
                  Your password has been reset. Sign in with your new password.
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
              <CardContent className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 shrink-0">
                    <CheckCircle2
                      className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                      aria-hidden
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-foreground leading-tight">
                      Reset complete
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground leading-tight">
                      You can now sign in with your new password. Use the button
                      below to go to the login page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95 shadow-sm">
              <CardContent className="px-5 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                      <KeyRound className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground leading-tight">
                        Next step
                      </h3>
                      <p className="text-xs text-muted-foreground leading-tight">
                        Sign in with your email and new password.
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" className="h-8 text-xs shrink-0">
                    <Link href="/auth/login">Login</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="w-full border-border/70 bg-card/95 shadow-sm lg:max-w-sm">
          <CardHeader className="space-y-5">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound className="size-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Choose a new password
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground/90">
                Finish resetting your account with a secure password you
                haven&apos;t used before.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/35 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  This reset link is tied to your request and should only be used
                  by the account owner.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full border-border/70 bg-card/95 shadow-sm lg:max-w-xl">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">
              Update password
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-muted-foreground/90">
              Enter your new password below to complete the reset.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col justify-center gap-4 items-stretch"
              >
                {email ? (
                  <div className="space-y-2">
                    <FormLabel htmlFor="email-display">Email</FormLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email-display"
                        type="email"
                        value={email}
                        readOnly
                        className="cursor-not-allowed bg-muted pl-9"
                        aria-readonly
                      />
                    </div>
                  </div>
                ) : null}
                <FormField
                  control={form.control}
                  name="newPassword"
                  rules={{
                    required: "Password is required",
                  }}
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
                            type={showNewPassword ? "text" : "password"}
                            value={field.value ?? ""}
                            placeholder="Enter password"
                            autoComplete="new-password"
                            onChange={(event) => {
                              field.onChange(event);
                              if (fieldState.error?.type === "manual") {
                                form.clearErrors("newPassword");
                              }
                            }}
                          />
                          <InputGroupAddon align="inline-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowNewPassword((s) => !s)}
                              aria-label={
                                showNewPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showNewPassword ? (
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
                  disabled={!isValid || isLoading || Boolean(passwordPolicyMessage)}
                >
                  {isLoading ? "Processing..." : "Set new password"}
                </Button>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" />
                    Back to login
                  </Link>

                  <p className="text-sm text-muted-foreground">
                    Need an account?{" "}
                    <Link
                      href="/auth/signup"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>
    </AuthWrapper>
  );
};
