'use client';

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useLogin, useLogins } from '../hooks/useAuth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import EmailInput from '@/app/shared/components/form-elements/Email-Input';
import TextInput from '@/app/shared/components/form-elements/Text-Input';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import { LoginForm } from '../model/model';
import AuthWrapper from '../AuthWrapper';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';

const LoginComponent = () => {
	const { register, handleSubmit, formState } = useForm<LoginForm>({
		mode: 'onChange',
		defaultValues: { email: 'teraps@yopmail.com', password: '12345678' }
	});

	const { isLoading, login } = useLogin();
	const { handleLogins } = useLogins();

	async function onSubmit(payload: LoginForm) {
		login(payload);
	}

	const { errors, isValid } = formState;

	function onError(err: any) {
		console.log(err);
	}
	const [showPassword, setShowPassword] = useState(false);

	const togglePassword = () => {
		setShowPassword(!showPassword);
	};
	return (
		<>
			<AuthWrapper>
				<section className='w-full flex gap-4 flex-col items-center justify-center'>
					<div className='text-center space-y-2'>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
							Welcome back
						</h1>
						<p className='text-gray-600 dark:text-gray-400'>
							Sign in to your ApartmentHub account
						</p>
					</div>
					{/*
					<section className="flex flex-col gap-3 items-center justify-center w-full">
						<button className="btn flex gap-3 btn-primary !w-5/6">
							Google
						</button>

						<section className="text-primary dark:text-secondary">
							Or
						</section>
					</section> */}
					<Card className='border-gray-200 dark:border-gray-700 w-full lg:w-1/3  bg-white dark:bg-gray-900'>
						<CardHeader className='space-y-1 pb-4'>
							<CardTitle className='text-xl font-semibold text-center text-gray-900 dark:text-white'>
								Sign In
							</CardTitle>
							<CardDescription className='text-center text-gray-600 dark:text-gray-400'>
								Enter your credentials to access your account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleSubmit(onSubmit, onError)}
								className='w-full flex flex-col justify-center gap-2 items-center'>
								<EmailInput
									name={'email'}
									label='Email'
									error={errors?.[
										'email'
									]?.message?.toString()}>
									<input
										{...register('email', {
											required: 'This field is required',
											pattern: {
												value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
												message: 'Invalid email address'
											}
										})}
										className='input-style'
										type='email'
										id='email'
										autoFocus
									/>
								</EmailInput>
								<TextInput
									name={'psw'}
									placeholder='Enter Password'
									label='Password'
									error={errors?.[
										'password'
									]?.message?.toString()}>
									<div className='flex border mt-1 pr-1  input-style flex-1 cursor-pointer items-center '>
										<input
											className='w-full bg-transparent cursor-pointer  border-none outline-none focus:ring-0 ring-0 '
											type={
												showPassword
													? 'text'
													: 'password'
											}
											{...register('password', {
												required:
													'This field is required'
											})}
											id='psw'
										/>

										{!showPassword ? (
											<FaEyeSlash
												className='cursor-pointer'
												onClick={togglePassword}
											/>
										) : (
											<FaEye
												className='cursor-pointer'
												onClick={togglePassword}
											/>
										)}
									</div>
								</TextInput>

								<ButtonComponent
									styles='w-full mt-4'
									btnText='Login'
									loading={isLoading}
									type='submit'
									disabled={!isValid || isLoading}
								/>

								<p className='flex gap-3 text-sm '>
									Forgot Password ?
									<Link
										href={'/auth/resetPassword'}
										className='text-blue-600 text-sm'>
										Reset
									</Link>
								</p>
								<p className='flex gap-3 text-sm '>
									Need An Account ?
									<Link
										href={'/auth/signup'}
										className='text-blue-600 text-sm'>
										Sign up
									</Link>
								</p>
							</form>
						</CardContent>
					</Card>

					<div className='text-center'>
						<p className='text-xs text-gray-500 dark:text-gray-400'>
							By signing in, you agree to our{' '}
							<Link
								href=''
								className='underline hover:text-gray-700 dark:hover:text-gray-300'>
								Terms of Service
							</Link>{' '}
							and{' '}
							<Link
								href=''
								className='underline hover:text-gray-700 dark:hover:text-gray-300'>
								Privacy Policy
							</Link>
						</p>
					</div>
				</section>
			</AuthWrapper>
		</>
	);
};

export default LoginComponent;
