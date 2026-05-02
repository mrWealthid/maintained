"use client";
import Link from "next/link";
import React, { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useUpdatePassword } from "../../hooks/useAuth";
import { IUpdatePassword } from "../../model/model";
import { Button } from "@/components/ui/button";
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
  FormMessage,
} from "@/components/ui/form";
import AuthWrapper from "../../AuthWrapper";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
export const UpdatePasswordForm: FC<{ token: string }> = ({ token }) => {
  const form = useForm<{ currentPassword: string; newPassword: string }>({
    mode: "onChange",
  });

  const { isLoading, updatePassword } = useUpdatePassword();

  async function onSubmit(payload: any) {
    const data: IUpdatePassword = {
      ...payload,
      resetToken: token,
    };
    updatePassword(data);
  }

  const {
    formState: { errors, isValid },
  } = form;

  function onError(err: any) {
    console.log(err);
  }
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <AuthWrapper>
      <section className="w-full dashboard-body flex gap-4 flex-col items-center justify-center">
        <div className="text-center space-y-2">
          {/* <h1 className="text-2xl font-bold text-foreground">
              Update Password Today
            </h1> */}
          {/* <p className="text-muted-foreground">
              Seamlessly update password in few steps
            </p> */}
        </div>

        <Card className="border-border w-full lg:w-1/3 bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-foreground">
              Update Password
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter new password to complete reset
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col justify-center gap-4 items-stretch"
              >
                {/* Password */}
                <FormField
                  control={form.control}
                  name="currentPassword"
                  rules={{
                    required: "This field is required",
                    minLength: { value: 8, message: "Min 8 characters" },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            value={field.value ?? ""} // prevent null warnings
                            placeholder="Enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage>
                        {errors.currentPassword && (
                          <ErrorMessage
                            errorMsg={errors.currentPassword.message!}
                          />
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  rules={{
                    required: "This field is required",
                    minLength: { value: 8, message: "Min 8 characters" },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showNewPassword ? "text" : "password"}
                            value={field.value ?? ""} // prevent null warnings
                            placeholder="Enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((s) => !s)}
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                            aria-label={
                              showNewPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showNewPassword ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage>
                        {errors.newPassword && (
                          <ErrorMessage
                            errorMsg={errors.newPassword.message!}
                          />
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={!isValid || isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Update Password
                </Button>

                <p className="flex gap-3 text-sm justify-center">
                  Need An Account?
                  <Link href="/auth/signup" className="text-primary text-sm">
                    Sign up
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link
              href=""
              className="underline hover:text-foreground"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href=""
              className="underline hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </section>
    </AuthWrapper>
  );
};
