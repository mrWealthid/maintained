"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useOnboardUser } from "../../hooks/useAuth";
import { OnboardUserForm } from "../../model/model";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import AuthWrapper from "../../AuthWrapper";
const OnboardingForm: FC<{ inviteToken: string }> = ({ inviteToken }) => {
  const form = useForm<OnboardUserForm>({
    mode: "onChange",
  });

  const {
    formState: { errors, isValid },
  } = form;

  const router = useRouter();
  const { isLoading, onboardUser } = useOnboardUser();

  async function onSubmit(payload: any) {
    const data = {
      ...payload,
      inviteToken: inviteToken,
    };

    onboardUser(data, { onSuccess: () => router.push("/auth/login") });
  }

  function onError(err: any) {
    console.log(err);
  }
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <AuthWrapper>
      <section className="w-full dashboard-body flex gap-4 flex-col items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back
          </h1>
          {/* <p className="text-muted-foreground">Activate User</p> */}
        </div>

        <Card className="border-border w-full lg:w-1/3 bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-foreground">
              Activate User
            </CardTitle>
            {/* <CardDescription className="text-center text-muted-foreground">
                Enter your credentials to access your account
              </CardDescription> */}
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
                  name="password"
                  rules={{
                    required: "This field is required",
                    minLength: { value: 8, message: "Min 8 characters" },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
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
                        {errors.password && (
                          <ErrorMessage errorMsg={errors.password.message!} />
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
                  Continue
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

export default OnboardingForm;
