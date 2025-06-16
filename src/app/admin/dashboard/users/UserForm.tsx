'use client';

import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateUser } from './hooks/userHooks';
import TextInput from '@/app/shared/components/form-elements/Text-Input';
import EmailInput from '@/app/shared/components/form-elements/Email-Input';
import ButtonComponent from '@/app/shared/components/form-elements/Button';
import { ROLES } from '@/utils/enums';
import {
	CreateUserPayload,
	ManageUserForm,
	ManageUserFormProps
} from '@/app/shared/model/model';

const UserForm: FC<ManageUserFormProps> = ({ user, onCloseModal }) => {
	const isEditing = !!user?.id;

	const { register, handleSubmit, getValues, formState } =
		useForm<ManageUserForm>({
			mode: 'all',
			defaultValues: isEditing ? { ...user } : {}
		});

	const { errors, isSubmitting } = formState;
	const { isCreating, createUser } = useCreateUser(
		user?.id,
		isEditing,
		onCloseModal
	);

	async function onSubmit(data: ManageUserForm) {
		const { firstName, lastName, ...rest } = data;

		const payload = {
			...rest,
			name: firstName + ' ' + lastName
		};

		createUser(payload);
	}

	function onError(err: any) {
		console.log(err);
	}

	return (
		<div className='w-full'>
			<form
				onSubmit={handleSubmit(onSubmit, onError)}
				className=' flex flex-1 p-1 sm:p-6   items-center'>
				<section className='flex-col flex gap-2 w-full'>
					<div className='w-full flex gap-4'>
						<TextInput
							name={'firstName'}
							label='First Name'
							type='password'
							error={errors?.['firstName']?.message?.toString()}>
							<input
								{...register('firstName', {
									required: 'This field is required'
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
							error={errors?.['lastName']?.message?.toString()}>
							<input
								{...register('lastName', {
									required: 'This field is required'
								})}
								className='input-style'
								type='text'
								id='lastName'
								placeholder='Enter Last Name'
							/>
						</TextInput>
					</div>
					<div className='w-full flex gap-4'>
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
								className='input-style  '
								type='email'
								id='email'
								placeholder='johndoe@gmail.com'
							/>
						</EmailInput>

						{/*
						<TextInput
							name={'lastName'}
							label='Last Name'
							error={errors?.['lastName']?.message?.toString()}>
							<input
								{...register('lastName', {
									required: 'This field is required'
								})}
								className='input-style'
								type='text'
								id='lastName'
								placeholder='Enter Last Name'
							/>
						</TextInput> */}
					</div>

					<div className='w-full flex gap-4'>
						<TextInput
							name={'role'}
							label='Role'
							error={errors?.['role']?.message?.toString()}>
							<select
								className='input-style'
								{...register('role', {
									required: 'This field is required'
								})}>
								<option> Select Role</option>
								<option> {ROLES.user}</option>
								<option> {ROLES.admin}</option>
							</select>
						</TextInput>
					</div>
					<hr className='-mx-6 my-3' />
					<section className='flex justify-end  gap-4'>
						<ButtonComponent
							type='reset'
							handleClick={() => onCloseModal?.()}
							styles='rounded-3xl'
							btnText={'Cancel'}></ButtonComponent>

						<ButtonComponent
							type='submit'
							styles='rounded-3xl'
							disabled={!formState.isValid || isSubmitting}
							loading={isCreating}
							btnText={` ${
								isEditing ? 'Update User' : ' Create User'
							}`}></ButtonComponent>
					</section>
				</section>
			</form>
		</div>
	);
};

export default UserForm;
