// 'use client';
// import { useRouter } from 'next/navigation';
// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useRegister } from '../hooks/useAuth';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import Link from 'next/link';
// import TextInput from '@/app/shared/components/form-elements/Text-Input';
// import EmailInput from '@/app/shared/components/form-elements/Email-Input';
// import ButtonComponent from '@/app/shared/components/form-elements/Button';
// import { RegisterForm } from '../model/model';
// import AuthWrapper from '../AuthWrapper';
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardHeader,
// 	CardTitle
// } from '@/components/ui/card';

// const SignupComponent = () => {
// 	const { register, handleSubmit, formState } = useForm<RegisterForm>({
// 		mode: 'onChange'
// 	});

// 	const router = useRouter();

// 	const { isLoading, registering } = useRegister();
// 	const { errors, isValid } = formState;

// 	async function onSubmit(data: RegisterForm) {
// 		const { firstName, lastName, ...rest } = data;

// 		const payload = {
// 			name: firstName + ' ' + lastName,
// 			...rest
// 		};

// 		registering(payload);
// 	}

// 	function onError(err: any) {
// 		console.log(err);
// 	}

// 	const [showPassword, setShowPassword] = useState(false);

// 	const togglePassword = () => {
// 		setShowPassword(!showPassword);
// 	};

// 	return (
// 		<AuthWrapper>
// 			<section className='w-full flex gap-4 flex-col items-center justify-center'>
// 				<div className='text-center space-y-2'>
// 					<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
// 						Create your account
// 					</h1>
// 					<p className='text-gray-600 dark:text-gray-400'>
// 						Join thousands of property professionals
// 					</p>
// 				</div>

// 				{/* <section className="flex flex-col gap-3 items-center justify-center w-full">
// 						<button className="btn flex gap-3 btn-primary">
// 							Google
// 						</button>

// 						<section className="text-primary dark:text-secondary">
// 							Or
// 						</section>
// 					</section> */}

// 				<Card className='border-gray-200 dark:border-gray-700 w-full lg:w-1/2 bg-white dark:bg-gray-900'>
// 					<CardHeader className='space-y-1 pb-4'>
// 						<CardTitle className='text-xl font-semibold text-center text-gray-900 dark:text-white'>
// 							Sign Up
// 						</CardTitle>
// 						<CardDescription className='text-center text-gray-600 dark:text-gray-400'>
// 							Create your ApartmentHub account to get started
// 						</CardDescription>
// 					</CardHeader>
// 					<CardContent>
// 						<form
// 							onSubmit={handleSubmit(onSubmit, onError)}
// 							className='w-full flex flex-col gap-2 items-center'>
// 							<section className='w-full border rounded-xl p-4'>
// 								<p className='text-sm  inline-block mb-4'>
// 									Business Details
// 								</p>
// 								<div className='w-full lg:flex-row flex-col flex lg:gap-4 gap-2'>
// 									<TextInput
// 										name={'businessName'}
// 										label='Name'
// 										error={errors?.[
// 											'businessName'
// 										]?.message?.toString()}>
// 										<input
// 											{...register('businessName', {
// 												required:
// 													'This field is required'
// 											})}
// 											className='input-style'
// 											type='text'
// 											id='businessName'
// 											placeholder='Enter Business Name'
// 										/>
// 									</TextInput>
// 									<TextInput
// 										name={'registrationId'}
// 										label='Registration Number'
// 										error={errors?.[
// 											'registrationId'
// 										]?.message?.toString()}>
// 										<input
// 											{...register('registrationId', {
// 												required:
// 													'This field is required'
// 											})}
// 											className='input-style'
// 											type='text'
// 											id='registrationId'
// 											placeholder='Enter Registration No.'
// 										/>
// 									</TextInput>
// 								</div>

// 								<div className='w-full lg:flex-row flex-col flex lg:gap-4 gap-2'>
// 									<EmailInput
// 										name={'businessEmail'}
// 										label='Email'
// 										error={errors?.[
// 											'businessEmail'
// 										]?.message?.toString()}>
// 										<input
// 											{...register('businessEmail', {
// 												required:
// 													'This field is required',
// 												pattern: {
// 													value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
// 													message:
// 														'Invalid email address'
// 												}
// 											})}
// 											className='input-style'
// 											type='email'
// 											id='businessEmail'
// 											placeholder='Enter Business Email'
// 										/>
// 									</EmailInput>

// 									<TextInput
// 										name={'businessContact'}
// 										label='Phone'
// 										error={errors?.[
// 											'businessContact'
// 										]?.message?.toString()}>
// 										<input
// 											placeholder='Enter Phone'
// 											className='input-style'
// 											{...register('businessContact', {
// 												required:
// 													'This field is required'
// 											})}
// 											id='businessContact'
// 										/>
// 									</TextInput>
// 								</div>
// 								<div className='w-full lg:flex-row flex-col flex lg:gap-4 gap-2'>
// 									<TextInput
// 										name={'businessAddress'}
// 										label='Address'
// 										error={errors?.[
// 											'businessAddress'
// 										]?.message?.toString()}>
// 										<input
// 											{...register('businessAddress', {
// 												required:
// 													'This field is required'
// 											})}
// 											className='input-style'
// 											type='text'
// 											id='businessAddress'
// 											placeholder='Enter Address'
// 										/>
// 									</TextInput>
// 									<TextInput
// 										name={'country'}
// 										label='Country'
// 										error={errors?.[
// 											'country'
// 										]?.message?.toString()}>
// 										<input
// 											{...register('country', {
// 												required:
// 													'This field is required'
// 											})}
// 											className='input-style'
// 											type='text'
// 											id='country'
// 											placeholder='Enter Country'
// 										/>
// 									</TextInput>
// 								</div>
// 							</section>

// 							<section className='w-full border mt-3 rounded-xl p-4'>
// 								<p className='text-sm  inline-block mb-4'>
// 									Personal Details
// 								</p>
// 								<div className='w-full lg:flex-row flex-col flex lg:gap-4 gap-2'>
// 									<TextInput
// 										name={'firstName'}
// 										label='First Name'
// 										type='password'
// 										error={errors?.[
// 											'firstName'
// 										]?.message?.toString()}>
// 										<input
// 											{...register('firstName', {
// 												required:
// 													'This field is required'
// 											})}
// 											className='input-style'
// 											type='text'
// 											id='firstName'
// 											placeholder='Enter First Name'
// 										/>
// 									</TextInput>
// 									<TextInput
// 										name={'lastName'}
// 										label='Last Name'
// 										error={errors?.[
// 											'lastName'
// 										]?.message?.toString()}>
// 										<input
// 											{...register('lastName', {
// 												required:
// 													'This field is required'
// 											})}
// 											className='input-style'
// 											type='text'
// 											id='lastName'
// 											placeholder='Enter Last Name'
// 										/>
// 									</TextInput>
// 								</div>
// 								<div className='w-full lg:flex-row flex-col flex lg:gap-4 gap-2'>
// 									<EmailInput
// 										name={'email'}
// 										label='Email'
// 										error={errors?.[
// 											'email'
// 										]?.message?.toString()}>
// 										<input
// 											{...register('email', {
// 												required:
// 													'This field is required',
// 												pattern: {
// 													value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
// 													message:
// 														'Invalid email address'
// 												}
// 											})}
// 											className='input-style  '
// 											type='email'
// 											id='email'
// 											placeholder='johndoe@gmail.com'
// 										/>
// 									</EmailInput>

// 									<TextInput
// 										name={'psw'}
// 										placeholder='Enter Password'
// 										label='Password'
// 										error={errors?.[
// 											'password'
// 										]?.message?.toString()}>
// 										<div className='flex border mt-1 pr-1  input-style flex-1 cursor-pointer items-center '>
// 											<input
// 												className='w-full bg-transparent cursor-pointer  border-none outline-none focus:ring-0 ring-0 '
// 												type={
// 													showPassword
// 														? 'text'
// 														: 'password'
// 												}
// 												{...register('password', {
// 													required:
// 														'This field is required'
// 												})}
// 												id='psw'
// 											/>

// 											{!showPassword ? (
// 												<FaEyeSlash
// 													className='cursor-pointer'
// 													onClick={togglePassword}
// 												/>
// 											) : (
// 												<FaEye
// 													className=' cursor-pointer'
// 													onClick={togglePassword}
// 												/>
// 											)}
// 										</div>
// 									</TextInput>
// 								</div>
// 							</section>
// 							<ButtonComponent
// 								styles='w-full mt-4'
// 								btnText='Register'
// 								type='submit'
// 								loading={isLoading}
// 								disabled={!isValid || isLoading}
// 								// afterIcon="/assets/send.svg"
// 							/>
// 							<p className='text-sm  flex gap-2'>
// 								Already Have An Account ?
// 								<Link
// 									href={'/auth/login'}
// 									className='text-blue-600 text-sm'>
// 									Login
// 								</Link>
// 							</p>
// 						</form>
// 					</CardContent>
// 				</Card>
// 			</section>
// 		</AuthWrapper>
// 	);
// };

// export default SignupComponent;

"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import { useRegister } from "../hooks/useAuth";
import AuthWrapper from "../AuthWrapper";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AddressSchema } from "@/lib/validation/address";
import AddressField from "@/app/shared/components/address/AddressField";
import ErrorMessage from "@/app/shared/components/form-elements/ErrorMessage";
import ButtonComponent from "@/app/shared/components/form-elements/Button";

const EmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const SignupSchema = z.object({
  // Business
  businessName: z.string().min(3, "This field is required"),
  registrationId: z.string().min(1, "This field is required"),
  businessEmail: z.string().regex(EmailRegex, "Invalid email address"),
  businessContact: z.string().min(1, "This field is required"),
  address: AddressSchema, // structured US address

  // Personal
  firstName: z.string().min(1, "This field is required"),
  lastName: z.string().min(1, "This field is required"),
  email: z.string().regex(EmailRegex, "Invalid email address"),
  password: z.string().min(8, "Min 8 characters"),
});

type SignupValues = z.infer<typeof SignupSchema>;

function formatSingleLineAddress(a: z.infer<typeof AddressSchema>) {
  const cityStateZip = [a.city, a.state, a.postalCode]
    .filter(Boolean)
    .join(" ");
  return [a.line1, cityStateZip].filter(Boolean).join(", ");
}

export default function SignupComponent() {
  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      registrationId: "",
      businessEmail: "",
      businessContact: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "NC",
        postalCode: "",
        country: "United States",
        lat: null,
        lng: null,
        placeId: "",
      },
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const {
    formState: { errors, isValid },
  } = form;

  const { isLoading, registering } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: SignupValues) => {
    const { firstName, lastName, address, ...rest } = data;

    const payload = {
      name: `${firstName} ${lastName}`,
      ...rest,
      businessAddress: formatSingleLineAddress(address), // keep your API contract
      country: address.country,
      addressLat: address.lat,
      addressLng: address.lng,
      addressPlaceId: address.placeId,
    };

    registering(payload);
  };

  return (
    <AuthWrapper>
      <section className="w-full flex gap-4 flex-col items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">
            Join thousands of property professionals
          </p>
        </div>

        <Card className="w-full lg:w-1/2">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">
              Sign Up
            </CardTitle>
            <CardDescription className="text-center">
              Create your ApartmentHub account to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-4"
              >
                {/* ---------------- Business Details ---------------- */}
                <section className="w-full border rounded-lg p-4">
                  <p className="text-sm mb-4">Business Details</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Business Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {errors.businessName && (
                              <ErrorMessage
                                errorMsg={errors.businessName.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Registration No."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {errors.registrationId && (
                              <ErrorMessage
                                errorMsg={errors.registrationId.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="business@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {errors.businessEmail && (
                              <ErrorMessage
                                errorMsg={errors.businessEmail.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter Phone"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {errors.businessContact && (
                              <ErrorMessage
                                errorMsg={errors.businessContact.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Business Address (US)
                    </p>
                    <AddressField
                      namePrefix="address"
                      proximity={{ lng: -79.792, lat: 36.0726 }} // optional bias
                    />
                  </div>
                </section>

                {/* ---------------- Personal Details ---------------- */}
                <section className="w-full border rounded-lg p-4">
                  <p className="text-sm mb-4">Personal Details</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter First Name" {...field} />
                          </FormControl>
                          <FormMessage>
                            {errors.firstName && (
                              <ErrorMessage
                                errorMsg={errors.firstName.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Last Name" {...field} />
                          </FormControl>
                          <FormMessage>
                            {errors.lastName && (
                              <ErrorMessage
                                errorMsg={errors.lastName.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="johndoe@gmail.com"
                              {...field}
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

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage>
                            {errors.password && (
                              <ErrorMessage
                                errorMsg={errors.password.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <ButtonComponent
                  styles="w-full mt-4"
                  btnText="Register"
                  loading={isLoading}
                  type="submit"
                  disabled={!isValid || isLoading}
                />

                <p className="text-sm text-center">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>
    </AuthWrapper>
  );
}
