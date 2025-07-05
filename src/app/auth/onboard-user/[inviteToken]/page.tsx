'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useOnboardUser } from '../../hooks/useAuth';
import { OnboardUserForm } from '../../model/model';
import TextInput from '@/shared/components/form-elements/Text-Input';
import ButtonComponent from '@/shared/components/form-elements/Button';

const OnboardingComponent: FC<{ params: { inviteToken: string } }> = ({
	params
}) => {
	const { register, handleSubmit, formState } = useForm<OnboardUserForm>({
		mode: 'onChange'
	});

	const router = useRouter();
	const { isLoading, onboardUser } = useOnboardUser();

	async function onSubmit(payload: any) {
		const data = {
			...payload,
			inviteToken: params.inviteToken
		};

		onboardUser(data, { onSuccess: () => router.push('/auth/login') });
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
			<section className='flex flex-col min-h-screen h-fit items-center justify-center'>
				<section className='border bg-card  w-5/6 md:w-4/6 lg:w-2/3 xl:w-1/3 py-10 px-5 flex gap-4 flex-col items-center justify-center'>
					<p className='text-center  font-bold text-2xl'>
						Activate User
					</p>

					<section className='w-full'>
						<form
							onSubmit={handleSubmit(onSubmit, onError)}
							action=''
							className='w-full flex flex-col justify-center gap-2 items-center'>
							<TextInput
								name={'dateOfBirth'}
								label='Date Of Birth'
								error={errors?.[
									'dateOfBirth'
								]?.message?.toString()}>
								<input
									{...register('dateOfBirth', {
										required: 'This field is required'
									})}
									className='input-style'
									type='date'
									id='dateOfBirth'
									autoFocus
								/>
							</TextInput>

							<TextInput
								name={'psw'}
								label='Password'
								error={errors?.[
									'password'
								]?.message?.toString()}>
								<div className='flex border mt-1 pr-1  input-style flex-1 cursor-pointer items-center '>
									<input
										className='w-full bg-transparent cursor-pointer  border-none outline-none focus:ring-0 ring-0 '
										type={
											showPassword ? 'text' : 'password'
										}
										{...register('password', {
											required: 'This field is required'
										})}
										id='psw'
									/>

									{!showPassword ? (
										<FaEyeSlash
											className=' cursor-pointer'
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
							{/* <TextInput
								name={'password'}
								label="Password"
								error={errors?.[
									'password'
								]?.message?.toString()}>
								<div className="input-style !p-0 !pr-2 !overflow-hidden">
									<input
										className="w-full  dark:bg-transparent   border-none outline-none focus:ring-0 ring-0 "
										// type={
										// 	showPassword ? 'text' : 'password'
										// }
										{...register('newPassword', {
											required: 'This field is required'
										})}
										id="newPassword"
										placeholder="Enter New  Password"
									/>
								</div>
							</TextInput>
							<TextInput
								name={'password'}
								label="Password"
								error={errors?.[
									'password'
								]?.message?.toString()}>
								<div className="input-style !p-0 !pr-2 !overflow-hidden">
									<input
										className="w-full  dark:bg-transparent   border-none outline-none focus:ring-0 ring-0 "
										// type={
										// 	showPassword ? 'text' : 'password'
										// }
										{...register('confirmNewPassword', {
											required: 'This field is required'
										})}
										placeholder="Confirm New Password"
										id="confirmPassword"
									/>
								</div>
							</TextInput> */}

							<ButtonComponent
								styles='w-full mt-4'
								btnText='Submit'
								loading={isLoading}
								type='submit'
								disabled={!isValid || isLoading}
							/>

							<p className='flex gap-3 text-sm '>
								Need An Account ?
								<Link
									href={'/auth/signup'}
									className='text-blue-600 text-sm'>
									Sign up
								</Link>
							</p>
						</form>
					</section>
				</section>
			</section>
		</>
	);
};

export default OnboardingComponent;
