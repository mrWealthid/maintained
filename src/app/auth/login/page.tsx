"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLogin } from "../hooks/useAuth";
import { LoginForm } from "../model/model";
import AuthWrapper from "../AuthWrapper";

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
import ErrorMessage from "@/app/shared/components/form-elements/ErrorMessage";
import ButtonComponent from "@/app/shared/components/form-elements/Button";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const LoginComponent = () => {
  const { isLoading, login } = useLogin();
  const form = useForm<LoginForm>({
    mode: "onChange",
    values: {
      email: "teraps@yopmail.com",
      password: "12345678",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const {
    formState: { errors, isValid },
  } = form;

  const onSubmit = (payload: LoginForm) => {
    login(payload);
  };

  return (
    <AuthWrapper>
      <section className="w-full dashboard-body flex gap-4 flex-col items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your ApartmentHub account
          </p>
        </div>

        <Card className="border-gray-200 dark:border-gray-700 w-full lg:w-1/3 bg-white dark:bg-gray-900">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-gray-900 dark:text-white">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col justify-center gap-4 items-stretch"
              >
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "This field is required",
                    pattern: {
                      value: emailRegex,
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
                          value={field.value ?? ""} // prevent null warnings
                          placeholder="you@example.com"
                        />
                      </FormControl>
                      <FormMessage>
                        {errors.email && (
                          <ErrorMessage errorMsg={errors.email.message!} />
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />

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

                <ButtonComponent
                  styles="w-full mt-4"
                  btnText="Login"
                  loading={isLoading}
                  type="submit"
                  disabled={!isValid || isLoading}
                />

                <p className="flex gap-3 text-sm justify-center">
                  Forgot Password?
                  <Link
                    href="/auth/resetPassword"
                    className="text-blue-600 text-sm"
                  >
                    Reset
                  </Link>
                </p>
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

export default LoginComponent;
