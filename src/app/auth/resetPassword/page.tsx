"use client";

import React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useResetPassword } from "../hooks/useAuth";
import { IResetPassword } from "../model/model";
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
import AuthWrapper from "../AuthWrapper";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import { EmailRegex } from "../data/data";
import { Button } from "@/components/ui/button";

const ResetPasswordComponent = () => {
  const form = useForm<{ email: string }>({
    mode: "onChange",
  });

  const { isLoading, resetPassword } = useResetPassword();

  async function onSubmit(payload: IResetPassword) {
    resetPassword(payload);
  }

  const {
    formState: { errors, isValid },
  } = form;

  function onError(err: unknown) {
    console.log(err);
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
                Reset your password
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground/90">
                We&apos;ll email a secure reset link so you can set a new password
                and return to your workspace.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <p>
                  Use the email tied to your account. The reset link is time-bound
                  and should only be used by you.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  After the email arrives, follow the link to create a new
                  password and sign in again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full border-border/70 bg-card/95 shadow-sm lg:max-w-xl">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">
              Send reset email
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-muted-foreground/90">
              Enter your account email and we&apos;ll send password reset
              instructions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="flex w-full flex-col items-stretch justify-center gap-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "This field is required",
                    pattern: {
                      value: EmailRegex,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          autoFocus
                          value={field.value ?? ""}
                          placeholder="you@example.com"
                        />
                      </FormControl>

                      {errors.email && (
                        <ErrorMessage errorMsg={errors.email.message!} />
                      )}
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={!isValid || isLoading}>
                  {isLoading ? "Processing..." : "Proceed"}
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

export default ResetPasswordComponent;
