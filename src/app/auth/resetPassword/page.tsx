"use client";

import React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useResetPassword } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
  FormMessage,
} from "@/components/ui/form";
import AuthWrapper from "../AuthWrapper";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import { EmailRegex } from "../data/data";

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

  function onError(err: any) {
    console.log(err);
  }

  return (
    // <>
    // 	<section className='flex flex-col min-h-screen h-fit items-center justify-center'>
    // 		<section className='border bg-card w-5/6 md:w-4/6 lg:w-2/3 xl:w-1/3 py-10 px-5 flex gap-4 flex-col items-center justify-center'>
    // 			<p className='text-center  font-bold text-2xl'>
    // 				Reset Password
    // 			</p>

    // 			<section className='w-full'>
    // 				<form
    // 					autoFocus
    // 					onSubmit={handleSubmit(onSubmit, onError)}
    // 					action=''
    // 					className='w-full flex flex-col justify-center gap-2 items-center'>
    // 					<EmailInput
    // 						name={'email'}
    // 						label='Email'
    // 						error={errors?.['email']?.message?.toString()}>
    // 						<input
    // 							{...register('email', {
    // 								required: 'This field is required',
    // 								pattern: {
    // 									value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    // 									message: 'Invalid email address'
    // 								}
    // 							})}
    // 							className='input-style'
    // 							type='email'
    // 							id='email'
    // 							autoFocus
    // 						/>
    // 					</EmailInput>

    // 					<ButtonComponent
    // 						styles='w-full mt-4'
    // 						btnText='Reset'
    // 						loading={isLoading}
    // 						type='submit'
    // 						disabled={!isValid || isLoading}
    // 					/>

    // 					<p className='flex gap-3 text-sm'>
    // 						Need An Account ?
    // 						<Link
    // 							href={'/auth/signup'}
    // 							className='text-primary text-sm'>
    // 							Sign up
    // 						</Link>
    // 					</p>
    // 				</form>
    // 			</section>
    // 		</section>
    // 	</section>
    // </>

    <AuthWrapper>
      <section className="w-full dashboard-body flex gap-4 flex-col items-center justify-center">
        {/* <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your ApartmentHub account
          </p>
        </div> */}

        <Card className="w-full lg:w-1/3">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-foreground">
              Reset Password
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
                {/* Email */}
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

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={!isValid || isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Send Reset Link
                </Button>

                <p className="flex gap-3 text-sm justify-center text-muted-foreground">
                  Forgot Password?
                  <Link
                    href="/auth/resetPassword"
                    className="text-primary hover:underline text-sm"
                  >
                    Reset
                  </Link>
                </p>
                <p className="flex gap-3 text-sm justify-center text-muted-foreground">
                  Need An Account?
                  <Link href="/auth/signup" className="text-primary hover:underline text-sm">
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
            <Link href="" className="underline hover:text-foreground transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </section>
    </AuthWrapper>
  );
};

export default ResetPasswordComponent;
