"use client";
import Link from "next/link";
import React, { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUpdatePassword } from "../../hooks/useAuth";
import { IUpdatePassword } from "../../model/model";
import ButtonComponent from "@/app/shared/components/form-elements/Button";
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
import ErrorMessage from "@/app/shared/components/form-elements/ErrorMessage";
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
          {/* <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Update Password Today
            </h1> */}
          {/* <p className="text-gray-600 dark:text-gray-400">
              Seamlessly update password in few steps
            </p> */}
        </div>

        <Card className="border-gray-200 dark:border-gray-700 w-full lg:w-1/3 bg-white dark:bg-gray-900">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-gray-900 dark:text-white">
              Update Password
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
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
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
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
                            {showNewPassword ? <FaEye /> : <FaEyeSlash />}
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

                <ButtonComponent
                  styles="w-full mt-4"
                  btnText="Login"
                  loading={isLoading}
                  type="submit"
                  disabled={!isValid || isLoading}
                />

                <p className="flex gap-3 text-sm justify-center">
                  Need An Account?
                  <Link href="/auth/signup" className="text-blue-600 text-sm">
                    Sign up
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our{" "}
            <Link
              href=""
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href=""
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </section>
    </AuthWrapper>
  );
};
