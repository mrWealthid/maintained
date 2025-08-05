'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRegister } from '../hooks/useAuth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import TextInput from '@/app/shared/components/form-elements/Text-Input';
import EmailInput from '@/app/shared/components/form-elements/Email-Input';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import { RegisterForm } from '../model/model';
import AuthWrapper from '../AuthWrapper';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';

const SignupComponent = () => {
	const { register, handleSubmit, formState } = useForm<RegisterForm>({
		mode: 'onChange'
	});

	const router = useRouter();

	const { isLoading, registering } = useRegister();
	const { errors, isValid } = formState;

	async function onSubmit(data: RegisterForm) {
		const { firstName, lastName, ...rest } = data;

		const payload = {
			name: firstName + ' ' + lastName,
			...rest
		};

		registering(payload);
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
			<section className='w-full flex gap-4 flex-col items-center justify-center'>
				<div className='text-center space-y-2'>
					<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
						Create your account
					</h1>
					<p className='text-gray-600 dark:text-gray-400'>
						Join thousands of property professionals
					</p>
				</div>

				{/* <section className="flex flex-col gap-3 items-center justify-center w-full">
						<button className="btn flex gap-3 btn-primary">
							Google
						</button>

						<section className="text-primary dark:text-secondary">
							Or
						</section>
					</section> */}

				<Card className='border-gray-200 dark:border-gray-700 w-full lg:w-1/2 bg-white dark:bg-gray-900'>
					<CardHeader className='space-y-1 pb-4'>
						<CardTitle className='text-xl font-semibold text-center text-gray-900 dark:text-white'>
							Sign Up
						</CardTitle>
						<CardDescription className='text-center text-gray-600 dark:text-gray-400'>
							Create your ApartmentHub account to get started
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleSubmit(onSubmit, onError)}
							className='w-full flex flex-col gap-2 items-center'>
							<section className='w-full border rounded-xl p-4'>
								<p className='text-sm  inline-block mb-4'>
									Business Details
								</p>
								<div className='w-full lg:flex-row flex-col flex lg:gap-4 gap-2'>
									<TextInput
										name={'businessName'}
										label='Name'
										error={errors?.[
											'businessName'
										]?.message?.toString()}>
										<input
											{...register('businessName', {
												required:
													'This field is required'
											})}
											className='input-style'
											type='text'
											id='businessName'
											placeholder='Enter Business Name'
										/>
									</TextInput>
									<TextInput
										name={'registrationId'}
										label='Registration Number'
										error={errors?.[
											'registrationId'
										]?.message?.toString()}>
										<input
											{...register('registrationId', {
												required:
													'This field is required'
											})}
											className='input-style'
											type='text'
											id='registrationId'
											placeholder='Enter Registration No.'
										/>
									</TextInput>
								</div>

								<div className='w-full lg:flex-row flex-col flex lg:gap-4 gap-2'>
									<EmailInput
										name={'businessEmail'}
										label='Email'
										error={errors?.[
											'businessEmail'
										]?.message?.toString()}>
										<input
											{...register('businessEmail', {
												required:
													'This field is required',
												pattern: {
													value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
													message:
														'Invalid email address'
												}
											})}
											className='input-style'
											type='email'
											id='businessEmail'
											placeholder='Enter Business Email'
										/>
									</EmailInput>

									<TextInput
										name={'businessContact'}
										label='Phone'
										error={errors?.[
											'businessContact'
										]?.message?.toString()}>
										<input
											placeholder='Enter Phone'
											className='input-style'
											{...register('businessContact', {
												required:
													'This field is required'
											})}
											id='businessContact'
										/>
									</TextInput>
								</div>
								<div className='w-full lg:flex-row flex-col flex lg:gap-4 gap-2'>
									<TextInput
										name={'businessAddress'}
										label='Address'
										error={errors?.[
											'businessAddress'
										]?.message?.toString()}>
										<input
											{...register('businessAddress', {
												required:
													'This field is required'
											})}
											className='input-style'
											type='text'
											id='businessAddress'
											placeholder='Enter Address'
										/>
									</TextInput>
									<TextInput
										name={'country'}
										label='Country'
										error={errors?.[
											'country'
										]?.message?.toString()}>
										<input
											{...register('country', {
												required:
													'This field is required'
											})}
											className='input-style'
											type='text'
											id='country'
											placeholder='Enter Country'
										/>
									</TextInput>
								</div>
							</section>

							<section className='w-full border mt-3 rounded-xl p-4'>
								<p className='text-sm  inline-block mb-4'>
									Personal Details
								</p>
								<div className='w-full lg:flex-row flex-col flex lg:gap-4 gap-2'>
									<TextInput
										name={'firstName'}
										label='First Name'
										type='password'
										error={errors?.[
											'firstName'
										]?.message?.toString()}>
										<input
											{...register('firstName', {
												required:
													'This field is required'
											})}
											className='input-style'
											type='text'
											id='firstName'
											placeholder='Enter First Name'
										/>
									</TextInput>
									<TextInput
										name={'lastName'}
										label='Last Name'
										error={errors?.[
											'lastName'
										]?.message?.toString()}>
										<input
											{...register('lastName', {
												required:
													'This field is required'
											})}
											className='input-style'
											type='text'
											id='lastName'
											placeholder='Enter Last Name'
										/>
									</TextInput>
								</div>
								<div className='w-full lg:flex-row flex-col flex lg:gap-4 gap-2'>
									<EmailInput
										name={'email'}
										label='Email'
										error={errors?.[
											'email'
										]?.message?.toString()}>
										<input
											{...register('email', {
												required:
													'This field is required',
												pattern: {
													value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
													message:
														'Invalid email address'
												}
											})}
											className='input-style  '
											type='email'
											id='email'
											placeholder='johndoe@gmail.com'
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
													className=' cursor-pointer'
													onClick={togglePassword}
												/>
											)}
										</div>
									</TextInput>
								</div>
							</section>
							<ButtonComponent
								styles='w-full mt-4'
								btnText='Register'
								type='submit'
								loading={isLoading}
								disabled={!isValid || isLoading}
								// afterIcon="/assets/send.svg"
							/>
							<p className='text-sm  flex gap-2'>
								Already Have An Account ?
								<Link
									href={'/auth/login'}
									className='text-blue-600 text-sm'>
									Login
								</Link>
							</p>
						</form>
					</CardContent>
				</Card>
			</section>
		</AuthWrapper>
	);
};

export default SignupComponent;
