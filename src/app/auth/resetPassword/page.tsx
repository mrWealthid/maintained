'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useResetPassword } from '../hooks/useAuth';
import EmailInput from '@/app/shared/components/form-elements/Email-Input';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import { IResetPassword } from '../model/model';

const ResetPasswordComponent = () => {
	const { register, handleSubmit, formState } = useForm<{ email: string }>({
		mode: 'onChange'
		// defaultValues: { email: 'admin@gmail.com', password: '12345678' }
	});

	const { isLoading, resetPassword } = useResetPassword();

	async function onSubmit(payload: IResetPassword) {
		resetPassword(payload);
	}

	const { errors, isValid } = formState;

	function onError(err: any) {
		console.log(err);
	}

	// async function send() {
	// 	'use server';
	// }

	return (
		<>
			<section className='flex flex-col min-h-screen h-fit items-center justify-center'>
				<section className='border bg-card w-5/6 md:w-4/6 lg:w-2/3 xl:w-1/3 py-10 px-5 flex gap-4 flex-col items-center justify-center'>
					<p className='text-center  font-bold text-2xl'>
						Reset Password
					</p>

					<section className='w-full'>
						<form
							autoFocus
							onSubmit={handleSubmit(onSubmit, onError)}
							action=''
							className='w-full flex flex-col justify-center gap-2 items-center'>
							<EmailInput
								name={'email'}
								label='Email'
								error={errors?.['email']?.message?.toString()}>
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

							<ButtonComponent
								styles='w-full mt-4'
								btnText='Reset'
								loading={isLoading}
								type='submit'
								disabled={!isValid || isLoading}
							/>

							<p className='flex gap-3 text-sm'>
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

export default ResetPasswordComponent;
