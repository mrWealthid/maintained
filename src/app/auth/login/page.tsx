"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  useLogin,
  usePasswordlessLoginConfig,
  usePasswordlessLoginRequest,
} from "../hooks/useAuth";
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
import { Button } from "@/components/ui/button";
import ErrorList from "@/components/ui/ErrorList";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import {
  PASSWORDLESS_LOGIN_QUERY_PARAM,
  PASSWORDLESS_LOGIN_STATUS,
} from "@/lib/auth/passwordless";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const AUTH_MODE = {
  PASSWORD: "password",
  PASSWORDLESS: "passwordless",
} as const;

type AuthMode = (typeof AUTH_MODE)[keyof typeof AUTH_MODE];

const LoginComponent = () => {
  const { isLoading, loginAsync, error } = useLogin();
  const { data: passwordlessConfig } = usePasswordlessLoginConfig();
  const {
    isLoading: isRequestingPasswordlessLogin,
    requestLinkAsync,
  } = usePasswordlessLoginRequest();
  const searchParams = useSearchParams();

  const form = useForm<LoginForm>({
    mode: "onChange",
    values: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(AUTH_MODE.PASSWORD);

  const emailValue = useWatch({ control: form.control, name: "email" });
  const passwordlessStatus = searchParams.get(
    PASSWORDLESS_LOGIN_QUERY_PARAM.STATUS,
  );
  const isPasswordlessEnabled = passwordlessConfig?.enabled === true;
  const activeAuthMode =
    isPasswordlessEnabled || authMode === AUTH_MODE.PASSWORD
      ? authMode
      : AUTH_MODE.PASSWORD;

  const {
    formState: { isValid },
  } = form;

  useEffect(() => {
    switch (passwordlessStatus) {
      case PASSWORDLESS_LOGIN_STATUS.INVALID_LINK:
        toast.error("This sign-in link is invalid or has expired.");
        break;
      case PASSWORDLESS_LOGIN_STATUS.DISABLED:
        toast.error("Passwordless sign-in is not enabled for this workspace.");
        break;
      case PASSWORDLESS_LOGIN_STATUS.IP_BLOCKED:
        toast.error("Your current IP address is not allowed for this workspace.");
        break;
      case PASSWORDLESS_LOGIN_STATUS.PASSWORD_EXPIRED:
        toast.error("Your password has expired. Reset it to continue.");
        break;
      case PASSWORDLESS_LOGIN_STATUS.REVOKED:
        toast.success("This sign-in link was revoked.");
        break;
      default:
        break;
    }
  }, [passwordlessStatus]);

  const onSubmit = async (payload: LoginForm) => {
    try {
      await loginAsync(payload);
      const next = searchParams.get("next");
      window.location.assign(next?.startsWith("/") ? next : "/dashboard");
    } catch (e) {
      console.error(e);
    }
  };

  const handlePasswordlessRequest = async () => {
    if (!emailRegex.test(emailValue ?? "")) {
      form.setError("email", {
        type: "manual",
        message: "Enter a valid email address first",
      });
      return;
    }

    try {
      const res = await requestLinkAsync({
        email: emailValue,
        next: searchParams.get("next") ?? undefined,
      });
      if (res?.message) toast.success(res.message);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthWrapper>
      <section className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your Properly account
          </p>
        </div>

        <div className="w-full space-y-4">
          <ErrorList error={error} title="Auth Error" />

          <Card className="w-full border-border/70 shadow-sm">
            <CardHeader className="space-y-4 pb-4">
              {isPasswordlessEnabled ? (
                <div className="inline-flex w-full rounded-xl bg-muted p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "flex-1 rounded-lg",
                      activeAuthMode === AUTH_MODE.PASSWORD
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setAuthMode(AUTH_MODE.PASSWORD)}
                  >
                    <KeyRound className="mr-2 size-4" />
                    Password
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "flex-1 rounded-lg",
                      activeAuthMode === AUTH_MODE.PASSWORDLESS
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setAuthMode(AUTH_MODE.PASSWORDLESS)}
                  >
                    <Mail className="mr-2 size-4" />
                    Email Link
                  </Button>
                </div>
              ) : null}

              <div className="space-y-1 text-center">
                <CardTitle className="text-xl font-semibold text-foreground">
                  {activeAuthMode === AUTH_MODE.PASSWORDLESS
                    ? "Email Sign-In Link"
                    : "Sign In"}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {activeAuthMode === AUTH_MODE.PASSWORDLESS
                    ? "Enter your email and we'll send a secure sign-in link."
                    : "Enter your credentials to access your account."}
                </CardDescription>
              </div>

              {activeAuthMode === AUTH_MODE.PASSWORDLESS ? (
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/35 p-4 text-sm text-muted-foreground">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    The sign-in link works across every workspace when
                    passwordless access is enabled.
                  </div>
                </div>
              ) : null}
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full flex flex-col justify-center gap-4 items-stretch"
                >
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
                            value={field.value ?? ""}
                            placeholder="you@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {activeAuthMode === AUTH_MODE.PASSWORD ? (
                    <>
                      <FormField
                        control={form.control}
                        name="password"
                        rules={{
                          required: "This field is required",
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupInput
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  value={field.value ?? ""}
                                  placeholder="Enter password"
                                />
                                <InputGroupAddon align="inline-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowPassword((s) => !s)}
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        className="rounded-xl"
                        type="submit"
                        disabled={!isValid || isLoading}
                      >
                        {isLoading && (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        {isLoading ? "Processing..." : "Sign in"}
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3 flex flex-col">
                      <Button
                        type="button"
                        className="rounded-xl"
                        onClick={handlePasswordlessRequest}
                        disabled={
                          !emailRegex.test(emailValue ?? "") ||
                          isRequestingPasswordlessLogin
                        }
                      >
                        <Mail className="mr-2 size-4" />
                        {isRequestingPasswordlessLogin
                          ? "Sending sign-in link..."
                          : "Send sign-in link"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => setAuthMode(AUTH_MODE.PASSWORD)}
                      >
                        <ArrowLeft className="mr-2 size-4" />
                        Back to password sign in
                      </Button>
                    </div>
                  )}

                  {activeAuthMode === AUTH_MODE.PASSWORD ? (
                    <p className="flex gap-3 text-sm justify-center text-muted-foreground">
                      Forgot Password?
                      <Link
                        href="/auth/resetPassword"
                        className="text-primary hover:underline text-sm"
                      >
                        Reset
                      </Link>
                    </p>
                  ) : null}
                  <p className="flex gap-3 text-sm justify-center text-muted-foreground">
                    Need An Account?
                    <Link
                      href="/auth/signup"
                      className="text-primary hover:underline text-sm"
                    >
                      Sign up
                    </Link>
                    <span aria-hidden>·</span>
                    <Link
                      href="/auth/signup?kind=trade"
                      className="text-primary hover:underline text-sm"
                    >
                      I&apos;m a tradesperson
                    </Link>
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link
              href=""
              className="underline hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href=""
              className="underline hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </section>
    </AuthWrapper>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginComponent />
    </Suspense>
  );
}
