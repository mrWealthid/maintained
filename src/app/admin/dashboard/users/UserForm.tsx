'use client';

import TextInput from '@/components/shared/Form-inputs/Text-Input';
import ButtonComponent from '@/components/shared/Form-inputs/Button';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import AutoComplete from '@/components/shared/AutoComplete/AutoComplete';
import {} from './service/user.service';
import { DateRangePicker } from '@/components/shared/DatePicker/DatePicker';
import {
	addDays,
	differenceInDays,
	formatISO,
	startOfDay,
	endOfDay,
	parseISO
} from 'date-fns';
import { useCreateUser } from './hooks/userHooks';
import EmailInput from '@/components/shared/Form-inputs/Email-Input';

const UserForm = ({ user, onCloseModal, settings }: any) => {
	const isEditing = !!user?.id;

	const { register, handleSubmit, getValues, formState } = useForm({
		mode: 'all',
		defaultValues: isEditing ? { ...user } : {},
		values: {}
	});

	const { errors, isSubmitting } = formState;
	const { isCreating, createUser } = useCreateUser(
		user?.id,
		isEditing,
		onCloseModal
	);

	async function onSubmit(data: any) {
		const { firstName, lastName, ...rest } = data;

		const payload = {
			...rest,
			name: firstName + ' ' + lastName
		};
		console.log(payload);

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
								<option> USER</option>
								<option> ADMIN</option>
							</select>
						</TextInput>
					</div>
					<section className='flex justify-end gap-4'>
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
